# TrustCal Setup Guide

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (free tier works)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trustcal?retryWrites=true&w=majority
BACKEND_PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important**: Replace `MONGO_URI` with your actual MongoDB Atlas connection string.

### 3. Start the Application

**Development Mode** (runs both backend and frontend):
```bash
npm run dev
```

**Or run separately**:

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 4. Access the Dashboard

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Testing

### Run Stress Test
```bash
npm test
```

### Test Scenarios via API

```bash
# Normal login
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "ipAddress": "192.168.1.1",
    "role": "user",
    "failedAttempts": 0
  }'

# Run simulation
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "multiFactor",
    "userId": "admin_user",
    "count": 5
  }'
```

## Switching Environments

To switch from development to production:

1. Update `.env`:
   - Change `MONGO_URI` to production cluster
   - Set `NODE_ENV=production`
   - Update `JWT_SECRET` to a strong production secret

2. Restart the server

No code changes required!

## Project Structure

```
trustcal/
├── server/
│   ├── config/          # Database configuration
│   ├── engines/         # Core engines (baseline, risk, decision, explainability)
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── App.js       # Main app component
│   └── public/
└── .env                 # Environment variables (not in git)
```

## Features

✅ Behavioral baseline tracking
✅ Multi-signal risk scoring
✅ Adaptive authentication decisions
✅ Structured explainability
✅ Premium dashboard UI
✅ Simulation engine
✅ Stress testing
✅ MongoDB Atlas integration
✅ Environment-based configuration

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
- Ensure database user has read/write permissions

### Frontend Not Loading
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify `proxy` setting in `client/package.json`

### Port Already in Use
- Change `BACKEND_PORT` in `.env`
- Or kill process using the port
