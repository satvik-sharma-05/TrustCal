# Running TrustCal - Quick Start Guide

## Prerequisites Check

Before running, ensure you have:
1. Node.js installed (v16+)
2. MongoDB Atlas account and connection string
3. Updated `.env` file with your MongoDB URI

## Step 1: Install Dependencies

Open a terminal in the project root and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Configure Environment

Edit `.env` file and update:
```env
MONGO_URI=your-actual-mongodb-atlas-connection-string
```

**Important**: Replace the placeholder MongoDB URI with your actual connection string from MongoDB Atlas.

## Step 3: Start the Backend Server

In terminal 1:
```bash
npm run server
```

You should see:
```
MongoDB Atlas Connected: ...
TrustCal Backend running on port 5000
Environment: development
```

## Step 4: Start the Frontend (Optional)

In terminal 2:
```bash
npm run client
```

Or run both together:
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## Step 5: Run API Tests

In a new terminal (while server is running):
```bash
node test-api.js
```

This will test:
- ✅ Health endpoint
- ✅ Normal login evaluation
- ✅ High-risk login (failed attempts)
- ✅ Geographic anomaly detection
- ✅ Simulation engine
- ✅ Stats endpoint
- ✅ Events endpoint
- ✅ User profile endpoint

## Manual API Testing

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### Test Login Evaluation
```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "ipAddress": "192.168.1.1",
    "role": "user",
    "failedAttempts": 0
  }'
```

### Run Simulation
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "multiFactor",
    "userId": "admin_user",
    "count": 5
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:5000/api/stats
```

## Expected Test Results

When running `node test-api.js`, you should see:

1. **Normal Login**: Risk score ~0-30, Decision: "allow"
2. **High Risk Login**: Risk score >70, Decision: "mfa" or "block"
3. **Geographic Anomaly**: Elevated risk score
4. **Simulation**: Multiple events generated successfully
5. **Stats**: Total logins, risk distribution, decision breakdown
6. **Events**: List of recent login events
7. **Profile**: User behavioral baseline data

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running (`npm run server`)
- Check if port 5000 is available
- Verify BACKEND_PORT in `.env`

### "MongoDB connection error"
- Verify MONGO_URI in `.env` is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Ensure database user has read/write permissions

### "Module not found"
- Run `npm install` in project root
- Run `npm install` in `client/` directory

### Frontend not loading
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify proxy setting in `client/package.json`

## Performance Testing

Run stress test (10,000 events):
```bash
npm test
```

This will:
- Generate 10,000 login events
- Measure average processing time
- Verify system stability
- Check if performance meets <500ms requirement

## Next Steps

After successful testing:
1. Access dashboard at http://localhost:3000
2. Use simulation panel to generate test scenarios
3. View risk scores, decisions, and explanations
4. Explore user profiles and behavioral baselines
