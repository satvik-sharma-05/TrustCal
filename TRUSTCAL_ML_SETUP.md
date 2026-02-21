# TrustCal ML – Setup Guide

## Prerequisites

- Node.js 16+ (existing backend)
- Python 3.9+ (for ML training and inference)
- MongoDB (existing)

## Quick start (ML mode)

### 1. Install Python ML dependencies

```bash
cd server/ml/python
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Train the model (first time)

```bash
# From server/ml/python with venv activated
python train.py
```

You should see:

- Generating synthetic dataset...
- Training Isolation Forest...
- Precision/Recall/F1/ROC-AUC
- Model saved to artifacts/

### 3. Start the ML inference server

```bash
# From server/ml/python with venv activated
python model_server.py
```

Server listens on **http://127.0.0.1:5001**.

### 4. Configure backend

In project root `.env`:

```env
ML_SERVER_URL=http://127.0.0.1:5001
ALLOW_MAX=30
MFA_MAX=70
```

Evaluation is ML-only; the model server must be running.

### 5. Start Node backend and frontend

```bash
# Terminal 1 – backend
npm run server

# Terminal 2 – frontend
cd client && npm start
```

### 6. Verify ML mode

- Open http://localhost:3000
- Header should show **“ML Model”** badge when the model is loaded.
- Run a simulation or evaluate a login; events will show **Anomaly Score** and **Feature Importance** (click an event).

## Without ML (rule-based only)

Leave `USE_ML=false` or omit it. Backend uses the existing rule-based engine only; no Python process needed.

## Troubleshooting

- **Model not loaded**: Run `python train.py` from `server/ml/python` so that `artifacts/isolation_forest.joblib` and `artifacts/scaler.joblib` exist. Then start `model_server.py`.
- **503 from /predict**: ML server not running or not reachable. Start `model_server.py` and ensure `ML_SERVER_URL` matches (default 5001).
- **Feature count mismatch**: Ensure Node `server/ml/featureNames.js` and Python `config.py` use the same 13 feature names in the same order.
