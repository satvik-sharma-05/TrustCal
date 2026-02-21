"""
Feature and model configuration - must match Node.js feature engineering.
Contamination and decision thresholds configurable via environment variables.
"""
import os

def _env_float(key: str, default: float, min_val: float = None, max_val: float = None) -> float:
    v = os.environ.get(key)
    if v is None:
        return default
    try:
        x = float(v)
        if min_val is not None and x < min_val:
            return min_val
        if max_val is not None and x > max_val:
            return max_val
        return x
    except ValueError:
        return default

def _env_int(key: str, default: int, min_val: int = None, max_val: int = None) -> int:
    v = os.environ.get(key)
    if v is None:
        return default
    try:
        x = int(v)
        if min_val is not None and x < min_val:
            return min_val
        if max_val is not None and x > max_val:
            return max_val
        return x
    except ValueError:
        return default

# Feature names in exact order expected by the model
FEATURE_NAMES = [
    "hour_normalized",
    "deviation_from_typical_hour",
    "is_weekend",
    "region_frequency_score",
    "is_new_region",
    "region_rarity_score",
    "device_seen_count_normalized",
    "is_new_device",
    "failed_attempts_normalized",
    "failed_attempt_rate",
    "time_since_last_login_normalized",
    "login_frequency_normalized",
    "role_importance",
]

# Model paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "metadata.json")

# Training config
N_SAMPLES_NORMAL = 12_000
N_SAMPLES_ATTACK = 3_000
RANDOM_STATE = 42
# Contamination: expected fraction of outliers in training. 0.05-0.1 realistic for normal-only training.
CONTAMINATION = _env_float("CONTAMINATION", 0.08, min_val=0.01, max_val=0.2)
N_ESTIMATORS = 100
MAX_SAMPLES = 256

# Decision thresholds (risk score 0-100). Used by Node; stored in metadata for validation.
# Allow <= ALLOW_THRESHOLD, MFA <= MFA_THRESHOLD, Block > MFA_THRESHOLD (or >= BLOCK_THRESHOLD).
ALLOW_THRESHOLD = _env_int("ALLOW_THRESHOLD", 30, min_val=0, max_val=100)
MFA_THRESHOLD = _env_int("MFA_THRESHOLD", 70, min_val=0, max_val=100)
BLOCK_THRESHOLD = _env_int("BLOCK_THRESHOLD", 70, min_val=0, max_val=100)

# Region/device encoding (match Node)
REGIONS = ["US-East", "US-West", "EU-Central", "EU-West", "AP-South", "AP-North"]
ROLE_MAP = {"user": 0.0, "admin": 0.5, "super_admin": 1.0}
