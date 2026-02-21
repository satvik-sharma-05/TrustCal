"""
TrustCal ML validation: assert risk score distribution for representative scenarios.
Run after train.py (model + metadata must exist). Exit 0 if all pass, 1 otherwise.
"""
import os
import sys

# Run from server/ml/python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import joblib
from config import FEATURE_NAMES, MODEL_PATH, SCALER_PATH, METADATA_PATH

# Feature order: hour_normalized, deviation_from_typical_hour, is_weekend,
# region_frequency_score, is_new_region, region_rarity_score,
# device_seen_count_normalized, is_new_device, failed_attempts_normalized,
# failed_attempt_rate, time_since_last_login_normalized, login_frequency_normalized, role_importance

def feature_vec(
    hour_norm=9/24,
    deviation=0.1,
    is_weekend=0.0,
    region_freq=0.7,
    is_new_region=0.0,
    region_rarity=0.5,
    device_seen=0.8,
    is_new_device=0.0,
    failed_norm=0.0,
    failed_rate=0.02,
    time_since=0.3,
    login_freq=0.5,
    role_imp=0.2,
):
    return [
        hour_norm, deviation, is_weekend, region_freq, is_new_region, region_rarity,
        device_seen, is_new_device, failed_norm, failed_rate, time_since, login_freq, role_imp,
    ]


# Bounds are targets; pass if risk is in range. Normal should be clearly low, extreme clearly high.
TEST_CASES = [
    {
        "name": "1. Normal login",
        "features": feature_vec(deviation=0.1, region_freq=0.8, device_seen=0.9, failed_norm=0.0),
        "risk_min": 0,
        "risk_max": 40,
    },
    {
        "name": "2. Slight anomaly",
        "features": feature_vec(deviation=0.4, region_freq=0.5, device_seen=0.5),
        "risk_min": 35,
        "risk_max": 65,
    },
    {
        "name": "3. New device + odd hour",
        "features": feature_vec(
            hour_norm=2/24, deviation=0.85, is_new_device=1.0, device_seen=0.0, region_freq=0.6
        ),
        "risk_min": 55,
        "risk_max": 85,
    },
    {
        "name": "4. 10 failed attempts + unknown device + new region",
        "features": feature_vec(
            failed_norm=1.0, failed_rate=0.6, is_new_device=1.0, device_seen=0.0,
            is_new_region=1.0, region_freq=0.0, region_rarity=0.9,
        ),
        "risk_min": 50,
        "risk_max": 100,
    },
    {
        "name": "5. Multi-factor anomaly",
        "features": feature_vec(
            hour_norm=3/24, deviation=0.9, is_weekend=1.0,
            region_freq=0.0, is_new_region=1.0, region_rarity=0.95,
            device_seen=0.0, is_new_device=1.0,
            failed_norm=0.8, failed_rate=0.5, time_since=0.05, login_freq=0.1, role_imp=0.8,
        ),
        "risk_min": 85,
        "risk_max": 100,
    },
]


def main():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        print("ERROR: Model or scaler not found. Run train.py first.")
        return 1
    if not os.path.exists(METADATA_PATH):
        print("ERROR: metadata.json not found. Run train.py first.")
        return 1

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(METADATA_PATH) as f:
        import json
        metadata = json.load(f)

    score_percentiles = metadata.get("score_percentiles")
    if not score_percentiles:
        print("WARNING: metadata has no score_percentiles; risk mapping may use fallback.")

    failed = []
    for tc in TEST_CASES:
        X = np.array([tc["features"]], dtype=np.float64)
        X_scaled = scaler.transform(X)
        raw = float(model.decision_function(X_scaled)[0])

        # Same percentile-based risk as model_server
        if score_percentiles:
            ps = sorted([(int(k), float(v)) for k, v in score_percentiles.items()])
            def raw_to_perc(r):
                if r <= ps[0][1]:
                    return float(ps[0][0])
                if r >= ps[-1][1]:
                    return float(ps[-1][0])
                for i in range(len(ps) - 1):
                    p_lo, v_lo = ps[i]
                    p_hi, v_hi = ps[i + 1]
                    if v_lo <= r <= v_hi:
                        t = (r - v_lo) / (v_hi - v_lo) if v_hi != v_lo else 0.0
                        return p_lo + t * (p_hi - p_lo)
                return 50.0
            def perc_to_risk(perc):
                if perc <= 5:
                    return 90.0 + (5.0 - perc) / 5.0 * 10.0
                if perc <= 20:
                    return 70.0 + (20.0 - perc) / 15.0 * 20.0
                if perc <= 80:
                    return 30.0 + (80.0 - perc) / 60.0 * 40.0
                return (100.0 - perc) / 20.0 * 30.0
            perc = raw_to_perc(raw)
            risk = int(round(np.clip(perc_to_risk(perc), 0, 100)))
        else:
            smin = metadata.get("score_min_train", -0.1)
            smax = metadata.get("score_max_train", 0.1)
            span = max(smax - smin, 1e-6)
            risk = int(round(np.clip((smax - raw) / span, 0, 1) * 100))

        ok = tc["risk_min"] <= risk <= tc["risk_max"]
        status = "PASS" if ok else "FAIL"
        print(f"  {status}: {tc['name']} -> risk={risk} (expected {tc['risk_min']}-{tc['risk_max']})")
        if not ok:
            failed.append(tc["name"])

    if failed:
        print(f"\nValidation failed: {len(failed)} case(s). Calibration may need adjustment.")
        return 1
    print("\nAll validation tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
