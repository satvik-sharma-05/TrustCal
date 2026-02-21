"""
FastAPI server: load model once, serve /predict and /health.
Risk score 0-100 via percentile-based calibration (no sigmoid compression).
Explainability: deviation magnitude and absolute deviation from baseline.
"""
import os
import json
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from config import FEATURE_NAMES, MODEL_PATH, SCALER_PATH, METADATA_PATH

app = FastAPI(title="TrustCal ML Inference")

model = None
scaler = None
metadata = None

# Percentile -> risk mapping: top 5% anomaly -> 90-100, 5-20% -> 70-90, middle -> 30-70, bottom -> 0-30
def _percentile_to_risk(perc: float) -> float:
    if perc <= 5:
        return 90.0 + (5.0 - perc) / 5.0 * 10.0
    if perc <= 20:
        return 70.0 + (20.0 - perc) / 15.0 * 20.0
    if perc <= 80:
        return 30.0 + (80.0 - perc) / 60.0 * 40.0
    return (100.0 - perc) / 20.0 * 30.0


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
    top_contributing_features: list[dict]  # name, value, contribution
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


@app.on_event("startup")
def startup():
    try:
        load_model()
        print("Model and scaler loaded successfully.")
    except FileNotFoundError as e:
        print(f"Startup warning: {e}. Run train.py to generate model.")


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
    if model is None or scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train.py first.")
    if len(req.features) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(FEATURE_NAMES)} features, got {len(req.features)}",
        )
    X = np.array([req.features], dtype=np.float64)
    X_scaled = scaler.transform(X)

    raw_score = float(model.decision_function(X_scaled)[0])
    score_percentiles = (metadata or {}).get("score_percentiles")
    if score_percentiles:
        perc = raw_score_to_percentile(raw_score, score_percentiles)
        risk_score = int(round(np.clip(_percentile_to_risk(perc), 0, 100)))
        anomaly_score = (100.0 - perc) / 100.0  # 0-1, higher = more anomalous
    else:
        # Fallback if metadata missing: min-max from training or simple linear
        score_min = (metadata or {}).get("score_min_train", -0.1)
        score_max = (metadata or {}).get("score_max_train", 0.1)
        span = max(score_max - score_min, 1e-6)
        anomaly_score = float(np.clip((score_max - raw_score) / span, 0, 1))
        risk_score = int(round(anomaly_score * 100))

    top_features = explain_anomaly(X_scaled[0])
    return PredictResponse(
        anomaly_score=anomaly_score,
        risk_score=risk_score,
        top_contributing_features=top_features,
        model_loaded=True,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
