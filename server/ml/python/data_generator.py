"""
Synthetic login data generator for training.
Produces normal and attack scenarios with proper feature vectors.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from config import FEATURE_NAMES, REGIONS, ROLE_MAP, N_SAMPLES_NORMAL, N_SAMPLES_ATTACK, RANDOM_STATE

np.random.seed(RANDOM_STATE)


def generate_normal_logins(n: int) -> pd.DataFrame:
    """Generate normal behavior: same region/device, typical hours, low failed attempts."""
    rows = []
    n_users = max(50, n // 200)
    user_ids = [f"user_{i}" for i in range(n_users)]
    
    for _ in range(n):
        uid = np.random.choice(user_ids)
        hour = np.random.normal(9, 2)  # Typical 9 AM ± 2h
        hour = np.clip(hour, 0, 23)
        day_of_week = np.random.choice([0, 1, 2, 3, 4], p=[0.22, 0.22, 0.22, 0.22, 0.12])  # Weekdays
        region_idx = np.random.choice(len(REGIONS))
        region = REGIONS[region_idx]
        device_id = f"dev_{hash(uid) % 5}"  # 5 devices per user
        failed = 0 if np.random.random() > 0.05 else 1
        role = np.random.choice(["user", "admin"], p=[0.9, 0.1])
        
        # Features
        hour_norm = hour / 24.0
        typical_hour = 9.0
        deviation = min(abs(hour - typical_hour) / 6.0, 1.0)
        is_weekend = 1.0 if day_of_week >= 5 else 0.0
        region_freq = 0.7 + np.random.random() * 0.3  # Known region
        is_new_region = 0.0
        region_rarity = 1.0 - (region_idx / len(REGIONS)) * 0.5
        device_seen = 0.6 + np.random.random() * 0.4
        is_new_device = 0.0
        failed_norm = failed / 10.0
        failed_rate = 0.02
        time_since = np.random.exponential(24)  # hours
        time_since_norm = min(time_since / 168.0, 1.0)
        login_freq = 0.3 + np.random.random() * 0.4  # 0.3-0.7 logins/day norm
        role_imp = ROLE_MAP[role]
        
        rows.append({
            "userId": uid,
            "hour_normalized": hour_norm,
            "deviation_from_typical_hour": deviation,
            "is_weekend": is_weekend,
            "region_frequency_score": region_freq,
            "is_new_region": is_new_region,
            "region_rarity_score": region_rarity,
            "device_seen_count_normalized": device_seen,
            "is_new_device": is_new_device,
            "failed_attempts_normalized": failed_norm,
            "failed_attempt_rate": failed_rate,
            "time_since_last_login_normalized": time_since_norm,
            "login_frequency_normalized": login_freq,
            "role_importance": role_imp,
            "label": 0,
        })
    
    return pd.DataFrame(rows)


def generate_attack_logins(n: int) -> pd.DataFrame:
    """Generate attack scenarios: geo anomaly, new device, brute force, time anomaly, privilege."""
    rows = []
    attack_types = ["brute_force", "geo_anomaly", "new_device", "time_anomaly", "privilege_escalation", "multi_factor"]
    weights = [0.25, 0.2, 0.2, 0.15, 0.1, 0.1]
    
    for _ in range(n):
        atype = np.random.choice(attack_types, p=weights)
        
        hour_norm = np.random.random()
        hour = hour_norm * 24
        typical = 9.0
        deviation = min(abs(hour - typical) / 6.0, 1.0)
        is_weekend = np.random.choice([0.0, 1.0], p=[0.7, 0.3])
        
        if atype == "brute_force":
            region_freq = 0.6 + np.random.random() * 0.2
            is_new_region = 0.0
            region_rarity = 0.5
            device_seen = 0.7
            is_new_device = 0.0
            failed_norm = 0.4 + np.random.random() * 0.5  # 4-9 attempts
            failed_rate = 0.5
            time_since_norm = 0.1
            login_freq = 0.2
            role_imp = 0.0
        elif atype == "geo_anomaly":
            region_freq = 0.0
            is_new_region = 1.0
            region_rarity = 0.9
            device_seen = 0.6
            is_new_device = 0.0
            failed_norm = 0.0
            failed_rate = 0.02
            time_since_norm = 0.5
            login_freq = 0.4
            role_imp = 0.0
        elif atype == "new_device":
            region_freq = 0.5
            is_new_region = 0.0
            region_rarity = 0.5
            device_seen = 0.0
            is_new_device = 1.0
            failed_norm = 0.0
            failed_rate = 0.02
            time_since_norm = 0.3
            login_freq = 0.4
            role_imp = 0.0
        elif atype == "time_anomaly":
            hour_norm = np.random.choice([0.05, 0.12, 0.92, 0.98])  # 1-3 AM or late night
            deviation = 0.8 + np.random.random() * 0.2
            region_freq = 0.6
            is_new_region = 0.0
            region_rarity = 0.5
            device_seen = 0.6
            is_new_device = 0.0
            failed_norm = 0.1
            failed_rate = 0.05
            time_since_norm = 0.4
            login_freq = 0.3
            role_imp = 0.0
        elif atype == "privilege_escalation":
            region_freq = 0.4
            is_new_region = 0.5
            region_rarity = 0.6
            device_seen = 0.3
            is_new_device = 0.5
            failed_norm = 0.2
            failed_rate = 0.1
            time_since_norm = 0.2
            login_freq = 0.2
            role_imp = 0.8 + np.random.random() * 0.2  # admin/super_admin
        else:  # multi_factor
            region_freq = 0.0
            is_new_region = 1.0
            region_rarity = 0.9
            device_seen = 0.0
            is_new_device = 1.0
            failed_norm = 0.3 + np.random.random() * 0.3
            failed_rate = 0.4
            deviation = 0.6 + np.random.random() * 0.3
            time_since_norm = 0.1
            login_freq = 0.1
            role_imp = 0.5 + np.random.random() * 0.5
        
        rows.append({
            "hour_normalized": hour_norm,
            "deviation_from_typical_hour": deviation,
            "is_weekend": is_weekend,
            "region_frequency_score": region_freq,
            "is_new_region": is_new_region,
            "region_rarity_score": region_rarity,
            "device_seen_count_normalized": device_seen,
            "is_new_device": is_new_device,
            "failed_attempts_normalized": failed_norm,
            "failed_attempt_rate": failed_rate,
            "time_since_last_login_normalized": time_since_norm,
            "login_frequency_normalized": login_freq,
            "role_importance": role_imp,
            "label": 1,
        })
    
    return pd.DataFrame(rows)


def get_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    """Extract feature matrix in model order."""
    return df[FEATURE_NAMES].values.astype(np.float64)


def generate_dataset() -> tuple:
    """Generate full dataset and return (X, y, df)."""
    df_normal = generate_normal_logins(N_SAMPLES_NORMAL)
    df_attack = generate_attack_logins(N_SAMPLES_ATTACK)
    df = pd.concat([df_normal, df_attack], ignore_index=True)
    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)
    X = get_feature_matrix(df)
    y = df["label"].values
    return X, y, df
