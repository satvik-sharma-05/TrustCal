# 🚀 TrustCal Quick Start

## Quick Setup (3 Steps)

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Configure MongoDB
Edit `.env` and set your MongoDB Atlas connection string:
```env
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/trustcal
```

### 3. Run the Project
```bash
# Option A: Run both backend and frontend together
npm run dev

# Option B: Run separately
# Terminal 1:
npm run server

# Terminal 2:
cd client && npm start
```

## Test the API

Once the server is running (port 5000), test it:

```bash
# Run automated tests
node test-api.js

# Or test manually
curl http://localhost:5000/health
```

## Access Dashboard

Open your browser: **http://localhost:3000**

## What to Test

1. **Health Check**: `GET /health`
2. **Evaluate Login**: `POST /api/evaluate` (see test-api.js for examples)
3. **Run Simulation**: Use the simulation panel in the dashboard
4. **View Stats**: Dashboard shows real-time statistics
5. **Check Events**: Timeline shows recent login events

## Expected Results

✅ Server starts on port 5000
✅ MongoDB connects successfully  
✅ API responds to requests
✅ Dashboard loads and displays data
✅ Risk scoring works (0-100 scores)
✅ Decisions are made (allow/mfa/block)

## Need Help?

See `RUN_TESTS.md` for detailed testing instructions.
See `SETUP.md` for complete setup guide.
