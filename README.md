# TrustCal ML

AI-powered identity risk scoring using **Isolation Forest** anomaly detection.

## Architecture

- **Backend**: Node.js + Express (MongoDB Atlas)
- **ML Service**: Python FastAPI (Isolation Forest)
- **Frontend**: React (Red + White cybersecurity theme)

## Setup

### 1. Install Dependencies

```bash
npm install
cd client && npm install && cd ..
cd server/ml/python && pip install -r requirements.txt && cd ../../..
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set:

```env
MONGO_URI=your-mongodb-atlas-connection-string
BACKEND_PORT=5000
ML_SERVER_URL=http://127.0.0.1:5001
ALLOW_MAX=30
MFA_MAX=70
```

### 3. Train Model

```bash
npm run train:ml
```

### 4. Start Services

**Terminal 1 - ML Server:**
```bash
npm run ml:server
```

**Terminal 2 - Backend:**
```bash
npm run server
```

**Terminal 3 - Frontend:**
```bash
npm run client
```

Or run all together:
```bash
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Use **Custom Login Evaluation** form to input login parameters
3. Click **Evaluate Login**
4. View anomaly score, risk score, decision, and feature contributions
5. Events appear in real-time feed

## Features

- **Adaptive identity risk engine**: ML-only scoring (Isolation Forest), no rule-based logic
- **Auto user management**: Optional `userId`; when omitted, a UUID is generated and stored
- **Generalized login input**: `userType` (employee, admin, super_admin, guest, contractor), `deviceType` (mobile, desktop, tablet, server, unknown), `isNewUser` flag, region, timestamp, failed attempts
- **Custom evaluation layer**: Feature engineering only (device/role/region encodings, timeSinceLastLogin, loginFrequencyScore, device/region usage, isNewDevice, isNewRegion); risk comes only from model anomaly output
- **Decision thresholds**: Configurable via `ALLOW_MAX` and `MFA_MAX` in `.env` (e.g. 0–30 Allow, 31–70 MFA, 71–100 Block)
- **Privacy**: Hashed userId, masked deviceId, region-level only (no raw IP), GDPR-style minimization
- Red + White cybersecurity UI, real-time event feed, feature contribution analysis

## API

- `POST /api/evaluate` - Evaluate login event
- `GET /api/events` - Get paginated events
- `GET /api/stats` - Dashboard statistics
- `GET /api/ml/status` - ML model status
- `GET /api/model-metadata` - Model metadata

## Model

- **Algorithm**: Isolation Forest (scikit-learn)
- **Training**: Normal-only data (12k samples)
- **Features**: 13-dimensional vector
- **Output**: Anomaly score (0-1) → Risk score (0-100)
