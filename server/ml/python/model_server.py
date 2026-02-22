"""
FastAPI server: load model once, serve /predict and /health.
Risk score 0-100 via percentile-based calibration (no sigmoid compression).
Explainability: deviation magnitude and absolute deviation from baseline.
"""
import os
import json
from contextlib import asynccontextmanager
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from config import FEATURE_NAMES, MODEL_PATH, SCALER_PATH, METADATA_PATH

model = None
scaler = None
metadata = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, no cleanup needed."""
    global model, scaler, metadata
    try:
        load_model()
        print("Model and scaler loaded successfully.")
    except FileNotFoundError as e:
        print(f"Startup warning: {e}. Run train.py to generate model.")
    yield
    # shutdown: nothing to do


app = FastAPI(title="TrustCal ML Inference", lifespan=lifespan)

def _calculate_confidence(score: float, meta: dict) -> float:
    """
    Confidence based on Z-score relative to normal training distribution.
    Statistical certainty increases as distance from normal mean increases (anomalies).
    Increases with training sample size.
    """
    mu = meta.get("anomaly_mean", -0.5)
    sigma = meta.get("anomaly_std", 0.05)
    n_train = meta.get("n_train", 0)
    
    # Avoid division by zero
    sigma = max(sigma, 1e-6)
    
    # Z-score: higher absolute Z = more certain it is an anomaly or very normal
    z = (score - mu) / sigma
    abs_z = abs(z)
    
    # Map Z to confidence base (0.7 to 0.9 range)
    # Higher Z = higher confidence
    conf = 0.7 + (min(abs_z, 4.0) / 4.0) * 0.2
    
    # Training size boost (logarithmic)
    # 10,000 samples is our "full" confidence benchmark
    size_factor = min(1.0, np.log1p(n_train) / np.log1p(10000))
    conf = conf * (0.9 + 0.1 * size_factor)
    
    # Adjust for anomalies vs normal as requested
    is_anomaly = score < mu - (2 * sigma)
    if is_anomaly:
        # Clear anomaly -> 80-95%
        conf = 0.8 + (conf - 0.7) * 0.75 # map 0.7-0.9 to roughly 0.8-0.95
    else:
        # Normal -> 70-90%
        # conf is already in 0.7-0.9 range roughly
        pass
        
    # Safeguard: Never below 50%
    # Baseline logins < 5 handled by Node or interpreted as n_train < 10 here
    if n_train < 10:
        conf = max(0.6, conf - 0.1)
        
    return round(float(np.clip(conf, 0.5, 0.98)), 3)


# mapping: ensures 0-100 spread
def _percentile_to_risk(perc: float) -> float:
    """
    Map percentile (0-100) to risk score (0-100).
    Lower percentile = lower raw score = more anomalous = higher risk.
    """
    if perc <= 5: # Top 5% anomaly
        return 90.0 + (5.0 - perc) / 5.0 * 10.0
    if perc <= 15: # 5-15%
        return 70.0 + (15.0 - perc) / 10.0 * 20.0
    if perc <= 40: # 15-40%
        return 40.0 + (40.0 - perc) / 25.0 * 30.0
    # Below median (perc > 50) -> low risk
    if perc >= 60:
        return max(0.0, (100.0 - perc) / 40.0 * 30.0)
    # 40-60 transitions
    return 30.0 + (60.0 - perc) / 20.0 * 10.0


def raw_score_to_percentile(raw: float, score_percentiles: dict) -> float:
    """Invert percentile table: raw score -> approximate percentile (0-100). Lower raw = lower percentile."""
    ps = sorted((int(k), float(v)) for k, v in score_percentiles.items())
    if raw <= ps[0][1]:
        return float(ps[0][0])
    if raw >= ps[-1][1]:
        return float(ps[-1][0])
    for i in range(len(ps) - 1):
        p_lo, v_lo = ps[i]
        p_hi, v_hi = ps[i + 1]
        if v_lo <= raw <= v_hi:
            t = (raw - v_lo) / (v_hi - v_lo) if v_hi != v_lo else 0.0
            return p_lo + t * (p_hi - p_lo)
    return 50.0


class PredictRequest(BaseModel):
    features: list[float]  # Same order as FEATURE_NAMES


class PredictResponse(BaseModel):
    anomaly_score: float  # 0-1
    risk_score: int  # 0-100
    model_confidence: float  # 0-1
    processing_time_ms: int
    top_contributing_features: list[dict]
    model_loaded: bool


def load_model():
    global model, scaler, metadata
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Model or scaler not found. Run train.py first. "
            f"Expected: {MODEL_PATH}, {SCALER_PATH}"
        )
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH) as f:
            metadata = json.load(f)
        if "model_confidence" not in metadata:
            metadata["model_confidence"] = round(metadata.get("f1", 0.85), 2)
    else:
        metadata = {"feature_names": FEATURE_NAMES, "model_confidence": 0.85}
    return model, scaler


def explain_anomaly(features_scaled: np.ndarray) -> list[dict]:
    """
    Explainability: deviation magnitude and impact. Baseline = 0 (scaled space).
    Contribution = change in raw score when setting feature to 0 (positive = increases anomaly).
    """
    base_score = model.decision_function(features_scaled.reshape(1, -1))[0]
    contributions = []
    for i in range(len(FEATURE_NAMES)):
        perturbed = features_scaled.copy()
        perturbed[i] = 0.0
        new_score = model.decision_function(perturbed.reshape(1, -1))[0]
        delta = base_score - new_score  # positive = feature pushes toward anomaly
        deviation = abs(float(features_scaled[i]))  # absolute deviation from baseline 0
        contributions.append({
            "name": FEATURE_NAMES[i],
            "value": round(float(features_scaled[i]), 4),
            "contribution": round(float(delta), 4),
            "deviation_magnitude": round(deviation, 4),
        })
    # Rank by absolute contribution (impact), then by deviation magnitude
    contributions.sort(key=lambda x: (abs(x["contribution"]), x["deviation_magnitude"]), reverse=True)
    return contributions[:3]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.get("/metadata")
def get_metadata():
    """Return model metadata for storage in MongoDB (model_metadata collection)."""
    if metadata is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    return metadata


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    import time
    start_t = time.perf_counter()
    
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train.py first.")
    if len(req.features) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(FEATURE_NAMES)} features, got {len(req.features)}",
        )
    X = np.array([req.features], dtype=np.float64)
    X_scaled = scaler.transform(X)

    # Use score_samples (lower = more anomalous)
    raw_score = float(model.score_samples(X_scaled)[0])
    score_percentiles = (metadata or {}).get("score_percentiles")
    
    if score_percentiles:
        perc = raw_score_to_percentile(raw_score, score_percentiles)
        risk_score = int(round(np.clip(_percentile_to_risk(perc), 0, 100)))
        anomaly_score = float(np.clip((100.0 - perc) / 100.0, 0, 1))
    else:
        # Fallback: min-max normalization
        score_min = (metadata or {}).get("score_min_train", -0.6)
        score_max = (metadata or {}).get("score_max_train", -0.4)
        span = max(score_max - score_min, 1e-6)
        # score_samples: more positive is more normal. anomaly is more negative.
        # anomaly_score 1 = anomalies (near score_min), 0 = normal (near score_max)
        anomaly_score = float(np.clip((score_max - raw_score) / span, 0, 1))
        risk_score = int(round(anomaly_score * 100))

    model_confidence = _calculate_confidence(raw_score, metadata or {})
    top_features = explain_anomaly(X_scaled[0])
    
    duration_ms = int((time.perf_counter() - start_t) * 1000)
    
    return PredictResponse(
        anomaly_score=anomaly_score,
        risk_score=risk_score,
        model_confidence=model_confidence,
        processing_time_ms=max(1, duration_ms),
        top_contributing_features=top_features,
        model_loaded=True,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
