# TrustCal ML

**TrustCal ML** is a privacy-preserving, AI-powered identity risk scoring dashboard. It uses an **Isolation Forest** anomaly detection model to score login events in real time, recommend MFA or block high-risk attempts, and surface analytics—all with simulated data so no real user credentials are used.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Training the Model](#training-the-model)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Features](#features)
- [ML Model](#ml-model)
- [Frontend](#frontend)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

TrustCal ML provides:

- **Real-time login risk scoring** using a 13-feature Isolation Forest model.
- **Configurable decisions**: Allow (low risk), MFA (medium), or Block (high risk) via environment thresholds.
- **Dashboard**: Stats, risk charts, anomaly distribution, feature importance, and a live event feed.
- **Privacy-first design**: Hashed user IDs, masked device identifiers, region-level data only; no raw IPs or PII in logs.
- **Simulated data**: Training and evaluation use synthetic data; no real credentials are required.

---

## Architecture

The system has three main parts:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Node Backend   │────▶│  Python ML      │
│   (port 3000)   │     │  (port 5000)    │     │  (port 5001)    │
│                 │     │  MongoDB Atlas  │     │  Isolation      │
│  Spline robot   │     │  Socket.io     │     │  Forest + FastAPI│
│  Dashboard UI   │     │  REST API      │     │  /predict        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend (React)**  
  - Served on port 3000.  
  - Landing: full-screen Spline 3D robot that **follows the cursor**; “Click to enter” with project description.  
  - After entering: dashboard (stats, charts, event list, user profile, custom login evaluation form).  
  - Real-time updates via Socket.io when new logins are evaluated.

- **Backend (Node.js + Express)**  
  - REST API and Socket.io on port 5000.  
  - Feature engineering from login payload; calls ML server for risk score.  
  - Persists events and user profiles in **MongoDB Atlas**.  
  - Applies configurable thresholds (ALLOW_MAX, MFA_MAX) to map risk score to decision.

- **ML Service (Python FastAPI)**  
  - Runs on port 5001.  
  - Loads trained Isolation Forest and scaler at startup.  
  - Exposes `/predict`: accepts 13-dimensional feature vector, returns anomaly score, risk score (0–100), and top feature contributions.

---

## Tech Stack

| Layer      | Technologies |
|-----------|--------------|
| Frontend  | React 18, Tailwind CSS, Recharts, Framer Motion, Spline (3D robot), Socket.io client, Axios |
| Backend   | Node.js, Express, Mongoose, Socket.io, dotenv |
| ML        | Python 3, FastAPI, scikit-learn (Isolation Forest), NumPy |
| Database  | MongoDB Atlas (or local MongoDB) |

---

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (v9+)
- **Python 3.8+** with `pip`
- **MongoDB**: Atlas account (or local MongoDB instance)
- A modern browser (Chrome, Firefox, Safari, Edge) for the Spline 3D scene

---

## Installation

### 1. Clone and install dependencies

From the project root:

```bash
# Install root (backend) dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Install Python ML dependencies
cd server/ml/python && pip install -r requirements.txt && cd ../../..
```

### 2. Environment configuration

Copy the example env file and edit with your values:

```bash
cp .env.example .env
```

See [Configuration](#configuration) for all variables.

### 3. Train the ML model (required before first evaluation)

```bash
npm run train:ml
```

This generates synthetic normal login data, trains the Isolation Forest, and saves the model and scaler under `server/ml/python/` (e.g. `model.pkl`, `scaler.pkl`).

---

## Configuration

Edit `.env` in the project root.

| Variable       | Description | Example |
|----------------|-------------|---------|
| `MONGO_URI`    | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/trustcal?retryWrites=true&w=majority` |
| `BACKEND_PORT` | Backend server port | `5000` |
| `NODE_ENV`     | Environment | `development` or `production` |
| `JWT_SECRET`   | Secret for JWT (if used) | long random string |
| `ML_SERVER_URL`| Python ML server base URL | `http://127.0.0.1:5001` |
| `ALLOW_MAX`    | Risk score ≤ this → **Allow** (0–100) | `30` |
| `MFA_MAX`      | Risk score ≤ this → **MFA**; above → **Block** | `70` |

Optional (see `server/ml/README.md`): `CONTAMINATION` for Isolation Forest, `ALLOW_THRESHOLD`, `MFA_THRESHOLD`, etc.

---

## Training the Model

Training uses **normal-only** synthetic data and fits an Isolation Forest. No anomaly data is required for training (unsupervised).

```bash
npm run train:ml
# or
cd server/ml/python && python train.py && cd ../../..
```

Outputs typically include:

- `model.pkl` – fitted Isolation Forest  
- `scaler.pkl` – feature scaler (fit on training data)  
- Metadata (model version, training date, feature schema, etc.)

Optional validation:

```bash
cd server/ml/python && python validate_ml.py && cd ../../..
```

---

## Running the Application

You need **three** processes: ML server, backend, and frontend.

### Option A: All together (recommended for development)

```bash
npm run dev
```

This starts:

- **ML server** (Python) – usually on port 5001  
- **Backend** (Node) – port 5000  
- **Frontend** (React) – port 3000  

### Option B: Separate terminals

**Terminal 1 – ML server**

```bash
npm run ml:server
```

**Terminal 2 – Backend**

```bash
npm run server
```

**Terminal 3 – Frontend**

```bash
npm run client
```

### Build for production

```bash
npm run build
```

This builds the React app into `client/build`. Serve it with any static file server or point your Node app to it.

---

## Usage

1. **Open the app**  
   Go to [http://localhost:3000](http://localhost:3000).

2. **Landing**  
   You see the full-screen 3D robot (Spline). Move the mouse – the robot **follows the cursor**. Read the short project description and click **“Click to enter”**.

3. **Dashboard**  
   After entering, the dashboard appears over the robot background:  
   - **Stats cards**: total logins, high risk, MFA, blocked, average risk, model confidence  
   - **Charts**: risk over time, anomaly distribution, decision breakdown  
   - **Feature importance** and **results gauge**  
   - **Event list**: paginated, searchable, filterable by decision  

4. **Evaluate a login**  
   Click **“Evaluate Login”**, fill the custom form (user type, device, region, failed attempts, etc.), and submit. The new event shows in the feed and in stats.

5. **User profile**  
   Click an event that has a `userId` to load that user’s profile (aggregated stats, risk history).

6. **Real-time updates**  
   New evaluations are pushed via Socket.io; the event list and stats update without refresh.

---

## API Reference

Base URL: `http://localhost:5000` (or your `BACKEND_PORT`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/evaluate` | Evaluate a login event (body: login params). Returns risk score, decision, explanation. |
| GET | `/api/events` | Paginated events. Query: `page`, `limit`, `search`, `decision` (allow/mfa/block). |
| GET | `/api/stats` | Dashboard stats (totals, high risk, MFA/block/allow counts, recent events for charts). |
| GET | `/api/ml/status` | ML service status (e.g. model loaded). |
| GET | `/api/model-metadata` | Model metadata (version, training date, feature schema). |
| GET | `/api/profile/:userId` | User profile and risk history for hashed `userId`. |
| POST | `/api/retrain` | Trigger ML retrain (if implemented). |

### Example: Evaluate login

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "employee",
    "deviceType": "desktop",
    "region": "us-east",
    "isNewUser": false,
    "failedAttempts": 0
  }'
```

---

## Features

- **ML-only risk engine**: No rule-based logic; decisions come from Isolation Forest output and env thresholds.
- **13-feature vector**: Time, region, device, role, failed attempts, login frequency, etc. (see [ML Model](#ml-model)).
- **Configurable thresholds**: `ALLOW_MAX` and `MFA_MAX` in `.env` define Allow / MFA / Block bands.
- **Auto user management**: Optional `userId`; if omitted, a UUID is generated and stored (hashed).
- **Privacy**: Hashed userId, masked deviceId, region-level only; GDPR-style minimization.
- **Explainability**: Top feature contributions per evaluation.
- **Real-time UI**: Socket.io for new events; dashboard stays in sync.
- **Landing experience**: Spline 3D robot with cursor-follow and “Click to enter” with project description.

---

## ML Model

- **Algorithm**: Isolation Forest (scikit-learn), trained on **normal-only** data (~12k samples).
- **Features (13)**:  
  `hour_normalized`, `deviation_from_typical_hour`, `is_weekend`, `region_frequency_score`, `is_new_region`, `region_rarity_score`, `device_seen_count_normalized`, `is_new_device`, `failed_attempts_normalized`, `failed_attempt_rate`, `time_since_last_login_normalized`, `login_frequency_normalized`, `role_importance`.
- **Output**:  
  - Raw anomaly score from `decision_function`.  
  - **Risk score 0–100** via percentile-based calibration (no sigmoid).  
  - Top 3 feature contributions for explainability.
- **Inference**: Python FastAPI server; Node backend does feature engineering and calls `/predict`.

See `server/ml/README.md` for training flow, validation, and config.

---

## Frontend

- **Landing**: Full-viewport Spline scene. Robot **follows the mouse**; position is updated from cursor (normalized to -1..1, scaled) with smooth lerp. “Click to enter” overlay shows a short project description and the line “Click to enter” below.
- **Theme**: Metallic/robotic (zinc/navy, glass panels, borders). Dashboard is semi-transparent so the robot remains visible in the background.
- **Key components**:  
  - `SplineRobotSection` – Spline scene + cursor-follow (runs with `renderOnDemand={false}` and `requestRender()` so position updates are visible).  
  - Stats cards, risk chart, anomaly distribution, decision chart, feature importance, results gauge, login timeline, user profile, custom login form.

---

## Troubleshooting

- **Robot doesn’t follow cursor**  
  - Ensure the Spline scene has at least one object with a `position` (e.g. named “Robot”, “Cube”, or any mesh). The app uses `findObjectByName` then falls back to `getAllObjects()` and the first object with position.  
  - The frontend uses `renderOnDemand={false}` and `requestRender()` after position updates so the canvas redraws.

- **“Backend offline”**  
  - Start the Node server: `npm run server`.  
  - Check `BACKEND_PORT` and that nothing else is using port 5000.

- **Evaluation fails / ML errors**  
  - Start the ML server: `npm run ml:server`.  
  - Ensure you ran `npm run train:ml` at least once.  
  - Check `ML_SERVER_URL` in `.env` (e.g. `http://127.0.0.1:5001`).

- **MongoDB connection errors**  
  - Verify `MONGO_URI` in `.env`.  
  - For Atlas: check IP whitelist and credentials.

- **CORS**  
  - In development, the React app uses a proxy to the backend (see `client/package.json`). For production, configure CORS on the backend or serve the build from the same origin.

---

## License

MIT.
