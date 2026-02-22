"""
TrustCal ML: Train Isolation Forest on NORMAL data only.
Validate on held-out normal + synthetic anomalies. Save model, scaler, metadata.
"""
import os
import json
from datetime import datetime, timezone
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

from config import (
    FEATURE_NAMES,
    MODEL_DIR,
    MODEL_PATH,
    SCALER_PATH,
    METADATA_PATH,
    N_SAMPLES_NORMAL,
    N_SAMPLES_ATTACK,
    RANDOM_STATE,
    CONTAMINATION,
    N_ESTIMATORS,
    MAX_SAMPLES,
    ALLOW_THRESHOLD,
    MFA_THRESHOLD,
    BLOCK_THRESHOLD,
)
from data_generator import generate_normal_logins, generate_attack_logins, get_feature_matrix


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 1. Generate data: normal (majority) and anomalies (minority, for validation only)
    print("Generating synthetic dataset...")
    df_normal = generate_normal_logins(N_SAMPLES_NORMAL)
    df_attack = generate_attack_logins(N_SAMPLES_ATTACK)

    X_normal = get_feature_matrix(df_normal)
    X_attack = get_feature_matrix(df_attack)

    # 2. Train only on normal data
    X_train, X_normal_val, _, _ = train_test_split(
        X_normal, np.zeros(len(X_normal)),
        test_size=0.2,
        random_state=RANDOM_STATE,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_normal_val_scaled = scaler.transform(X_normal_val)
    X_attack_scaled = scaler.transform(X_attack)

    # 3. Fit Isolation Forest on normal data only (unsupervised)
    # contamination: expected fraction of outliers in training; we use small value for normal-only
    print("Training Isolation Forest on normal data only...")
    clf = IsolationForest(
        n_estimators=N_ESTIMATORS,
        max_samples=MAX_SAMPLES,
        contamination=CONTAMINATION,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    clf.fit(X_train_scaled)

    # 4. Raw scores: score_samples (lower = more anomalous)
    raw_train = clf.score_samples(X_train_scaled)
    raw_normal_val = clf.score_samples(X_normal_val_scaled)
    raw_attack = clf.score_samples(X_attack_scaled)

    # Training distribution (normal only) for Z-score and min/max calibration
    anomaly_mean = float(np.mean(raw_train))
    anomaly_std = float(np.std(raw_train))
    score_min_train = float(np.min(raw_train))
    score_max_train = float(np.max(raw_train))

    # Calibration: percentile distribution from validation set (normal + attack) for risk mapping
    all_raw = np.concatenate([raw_normal_val, raw_attack])
    percentiles = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99]
    score_percentiles = {p: float(np.percentile(all_raw, p)) for p in percentiles}

    # Anomaly score 0-1 for metrics (percentile rank: lower raw = more anomalous = higher rank)
    def raw_to_anomaly_01(raw_vals):
        return np.searchsorted(np.sort(all_raw), raw_vals, side="right").astype(np.float64) / len(all_raw)

    score_normal = raw_to_anomaly_01(raw_normal_val)
    score_attack = raw_to_anomaly_01(raw_attack)

    # Binary predictions for metrics: threshold 0.5 (top half anomaly score = anomaly)
    pred_normal = (score_normal >= 0.5).astype(int)
    pred_attack = (score_attack >= 0.5).astype(int)
    y_true = np.array([0] * len(pred_normal) + [1] * len(pred_attack))
    y_pred = np.concatenate([1 - pred_normal, pred_attack])  # 1 = anomaly

    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    try:
        auc = roc_auc_score(
            y_true,
            np.concatenate([score_normal, score_attack]),
        )
    except Exception:
        auc = 0.5
    cm = confusion_matrix(y_true, y_pred)

    print(f"  Precision: {precision:.3f}, Recall: {recall:.3f}, F1: {f1:.3f}, ROC-AUC: {auc:.3f}")
    print("  Confusion matrix (normal, anomaly):", cm.tolist())
    print(f"  Raw score range (training): [{score_min_train:.4f}, {score_max_train:.4f}]")
    print(f"  Calibration percentiles (validation): p5={score_percentiles[5]:.4f}, p95={score_percentiles[95]:.4f}")

    # 5. Save artifacts
    import joblib
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    now = datetime.now(timezone.utc)
    training_date = now.isoformat().replace("+00:00", "Z")
    model_confidence = round((precision + recall + f1) / 3.0, 2)
    metadata = {
        "modelVersion": f"1.0.{int(now.timestamp())}",
        "trainingDate": training_date,
        "contamination": CONTAMINATION,
        "featureSchema": FEATURE_NAMES,
        "n_features": len(FEATURE_NAMES),
        "anomaly_mean": anomaly_mean,
        "anomaly_std": anomaly_std,
        "score_min_train": score_min_train,
        "score_max_train": score_max_train,
        "score_percentiles": score_percentiles,
        "allow_threshold": ALLOW_THRESHOLD,
        "mfa_threshold": MFA_THRESHOLD,
        "block_threshold": BLOCK_THRESHOLD,
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "roc_auc": float(auc),
        "model_confidence": model_confidence,
        "n_train": int(len(X_train)),
        "n_validation_normal": int(len(X_normal_val)),
        "n_validation_anomaly": int(len(X_attack)),
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")
    print(f"Metadata saved to {METADATA_PATH}")
    return clf, scaler, metadata


if __name__ == "__main__":
    train()
