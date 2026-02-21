# TrustCal ML – Pure ML Architecture

TrustCal ML uses **only Isolation Forest** for identity risk scoring. There is no rule-based engine, no hardcoded weights, and no manual risk logic.

## Flow

1. **Training** (Python): Generate synthetic **normal** logins (10k+), fit Isolation Forest on normal data only. Optionally generate anomaly data for validation (precision, recall, F1, ROC-AUC). Save model, scaler, and metadata (modelVersion, trainingDate, contamination, featureSchema).
2. **Inference** (Python): Load model once at startup. For each request: scale features → `decision_function` → map raw score to risk 0–100 via **percentile-based calibration** (no sigmoid compression). Explainability: top 3 features by deviation magnitude and contribution.
3. **Backend** (Node): Feature engineering using user profile (baseline); send feature vector to ML server; receive anomaly/risk and top features; map risk to decision via **env-configurable thresholds** (ALLOW_MAX, MFA_MAX); store event + featureVector + anomalyScore + riskScore + decision + explanation in MongoDB.
4. **Decisions**: Derived only from model risk score and env thresholds. No manual rules.

## Feature vector (13)

Same order in Node and Python:

- hour_normalized, deviation_from_typical_hour, is_weekend  
- region_frequency_score, is_new_region, region_rarity_score  
- device_seen_count_normalized, is_new_device  
- failed_attempts_normalized, failed_attempt_rate  
- time_since_last_login_normalized, login_frequency_normalized  
- role_importance  

All numeric; scaling uses the training-time scaler.

## Config (env)

- `ML_SERVER_URL` – Python inference server (default 5001).
- `ALLOW_THRESHOLD` / `ALLOW_MAX` – Risk ≤ this → Allow (default 30).
- `MFA_THRESHOLD` / `MFA_MAX` – Risk ≤ this → MFA; above → Block (default 70).
- `BLOCK_THRESHOLD` – Optional; Block when risk ≥ this (defaults to MFA threshold).
- `CONTAMINATION` – Isolation Forest contamination, 0.05–0.1 typical (default 0.08).

## Validation

After training, run:

```bash
cd server/ml/python && python validate_ml.py
```

This checks five scenarios: normal login (risk &lt; 40), slight anomaly (35–65), new device + odd hour (55–85), 10 failed + unknown device + new region (≥ 50), multi-factor anomaly (≥ 85). If tests fail, try adjusting `CONTAMINATION` (e.g. 0.05) and retraining.

## Removed

- Rule-based risk engine, decision engine, explainability engine.
- Hardcoded weights and manual risk stacking.
- USE_ML toggle (evaluation is ML-only; if the model is unavailable, the API returns an error).
