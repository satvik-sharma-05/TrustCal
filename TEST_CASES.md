# TrustCal Test Cases & Verification Guide

## ✅ How to Know It's Working

### 1. **Backend Health Check**
```bash
curl http://localhost:5000/health
```
**Expected**: `{"status":"ok","timestamp":"..."}`

### 2. **Frontend Dashboard**
- Open http://localhost:3000
- You should see:
  - ✅ Dark theme dashboard
  - ✅ Stats cards showing numbers
  - ✅ Risk gauge (circular chart)
  - ✅ Login timeline
  - ✅ Charts and graphs

### 3. **Database Connection**
Check terminal where backend is running:
- ✅ Should see: `MongoDB Atlas Connected: cluster0-shard-00-00...`
- ❌ If you see connection errors, check Network Access in Atlas

---

## 🧪 Comprehensive Test Cases

### Test Case 1: Normal User Behavior (Low Risk)
**Purpose**: Verify normal logins get low risk scores

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "ipAddress": "192.168.1.100",
    "role": "user",
    "failedAttempts": 0,
    "timestamp": "2026-02-21T09:00:00Z"
  }'
```

**Expected Result**:
- Risk Score: **0-30** (Low)
- Decision: **"allow"**
- Explanation: "Login appears normal"
- Signals: All low values

**Run 5 times** with same user to build baseline:
```bash
# Run this 5 times to establish baseline
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/evaluate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"alice\",\"ipAddress\":\"192.168.1.100\",\"role\":\"user\",\"failedAttempts\":0}"
  sleep 1
done
```

---

### Test Case 2: New Device Detection (Moderate Risk)
**Purpose**: Verify new device triggers moderate risk

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "ipAddress": "192.168.1.200",
    "role": "user",
    "failedAttempts": 0
  }'
```

**Expected Result**:
- Risk Score: **31-70** (Medium)
- Decision: **"mfa"** (Step-up authentication)
- Explanation: Mentions "unrecognized device"
- Device Novelty signal: **> 0**

---

### Test Case 3: Geographic Anomaly (Elevated Risk)
**Purpose**: Verify login from new region triggers risk

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "ipAddress": "203.0.113.50",
    "role": "user",
    "failedAttempts": 0
  }'
```

**Expected Result**:
- Risk Score: **31-70** (Medium)
- Decision: **"mfa"**
- Explanation: Mentions "new or unusual geographic region"
- Geographic Anomaly signal: **> 0**

---

### Test Case 4: Failed Attempt Spike (High Risk)
**Purpose**: Verify multiple failed attempts trigger high risk

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "ipAddress": "192.168.1.100",
    "role": "user",
    "failedAttempts": 5
  }'
```

**Expected Result**:
- Risk Score: **71-100** (High)
- Decision: **"mfa"** or **"block"** (if multi-factor anomaly)
- Explanation: Mentions "elevated failed login attempts"
- Failed Attempts signal: **> 50**

---

### Test Case 5: Privileged User Anomaly (Amplified Risk)
**Purpose**: Verify admin accounts get higher risk weighting

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin_bob",
    "ipAddress": "192.168.1.150",
    "role": "admin",
    "failedAttempts": 2
  }'
```

**Expected Result**:
- Risk Score: **Higher than normal user** with same inputs
- Decision: **"mfa"** or **"block"**
- Explanation: Mentions "privileged account access"
- Privilege Sensitivity: **> 100** (multiplier applied)

---

### Test Case 6: Multi-Factor Anomaly (Block Decision)
**Purpose**: Verify multiple anomalies trigger block

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "ipAddress": "203.0.113.100",
    "role": "admin",
    "failedAttempts": 4,
    "timestamp": "2026-02-21T03:00:00Z"
  }'
```

**Expected Result**:
- Risk Score: **71-100** (High)
- Decision: **"block"** (multiple anomalies)
- Explanation: Lists multiple risk factors
- Multiple signals triggered: **Time + Geo + Failed + Privilege**

---

### Test Case 7: New User Cold Start (Neutral Baseline)
**Purpose**: Verify new users get neutral baseline

```bash
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "new_user_123",
    "ipAddress": "192.168.1.50",
    "role": "user",
    "failedAttempts": 0
  }'
```

**Expected Result**:
- Risk Score: **0-30** (Low - neutral baseline)
- Decision: **"allow"**
- Explanation: Mentions new user or neutral baseline
- All signals: **0** (no baseline yet)

---

### Test Case 8: Time Deviation Anomaly
**Purpose**: Verify unusual login time triggers risk

```bash
# First, establish baseline with normal hours (9 AM)
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/evaluate \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"charlie\",\"ipAddress\":\"192.168.1.100\",\"role\":\"user\",\"failedAttempts\":0,\"timestamp\":\"2026-02-21T09:00:00Z\"}"
done

# Then test unusual time (3 AM)
curl -X POST http://localhost:5000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "charlie",
    "ipAddress": "192.168.1.100",
    "role": "user",
    "failedAttempts": 0,
    "timestamp": "2026-02-21T03:00:00Z"
  }'
```

**Expected Result**:
- Risk Score: **31-70** (Medium)
- Decision: **"mfa"**
- Explanation: Mentions "deviation from typical login time"
- Time Deviation signal: **> 0**

---

## 🎮 Using Simulation Engine

### Scenario 1: Normal Behavior
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "normal",
    "userId": "test_user",
    "count": 10
  }'
```

### Scenario 2: New Device Attack
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "newDevice",
    "userId": "test_user",
    "count": 5
  }'
```

### Scenario 3: Geographic Attack
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "geoAnomaly",
    "userId": "test_user",
    "count": 5
  }'
```

### Scenario 4: Brute Force Attack
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "failedAttempts",
    "userId": "test_user",
    "count": 5
  }'
```

### Scenario 5: Privileged Account Attack
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "privileged",
    "userId": "admin_user",
    "count": 5
  }'
```

### Scenario 6: Multi-Factor Attack (Most Dangerous)
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "multiFactor",
    "userId": "admin_user",
    "count": 5
  }'
```

### Scenario 7: New User Registration
```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "newUser",
    "userId": "new_user",
    "count": 3
  }'
```

---

## 📊 Verification Checklist

After running tests, verify:

### ✅ Dashboard Shows Data
- [ ] Stats cards show numbers > 0
- [ ] Risk gauge displays scores
- [ ] Timeline shows login events
- [ ] Charts render properly

### ✅ Risk Scoring Works
- [ ] Normal logins → Low risk (0-30)
- [ ] Anomalies → Medium/High risk (31-100)
- [ ] Scores are deterministic (same input = same score)

### ✅ Decisions Are Correct
- [ ] Low risk (0-30) → "allow"
- [ ] Medium risk (31-70) → "mfa"
- [ ] High risk (71-100) → "mfa" or "block"
- [ ] Block only with multi-factor anomalies

### ✅ Baseline Learning Works
- [ ] First login → Neutral baseline
- [ ] Multiple logins → Baseline updates
- [ ] Known devices/regions → Lower risk
- [ ] New devices/regions → Higher risk

### ✅ Explanations Are Clear
- [ ] Every decision has explanation
- [ ] Signals are listed
- [ ] Plain language summary provided
- [ ] Risk factors identified

---

## 🚀 Quick Test Script

Run this to test everything at once:

```bash
node test-api.js
```

This will:
1. Test health endpoint
2. Test normal login
3. Test high-risk login
4. Test geographic anomaly
5. Test simulation engine
6. Test stats endpoint
7. Test events endpoint
8. Test user profile endpoint

---

## 💡 Dynamic Test Cases

Yes! The simulation engine should be dynamic. Here are advanced scenarios:

### Dynamic Scenario 1: Gradual Attack Escalation
```javascript
// Simulate attacker gradually increasing failed attempts
for (let attempts = 0; attempts <= 10; attempts++) {
  await evaluateLogin({
    userId: "target_user",
    failedAttempts: attempts,
    // ... other fields
  });
}
```

### Dynamic Scenario 2: Time-Based Attack Pattern
```javascript
// Simulate attacks at different times
const attackTimes = [2, 3, 4, 5]; // Early morning hours
for (const hour of attackTimes) {
  await evaluateLogin({
    userId: "target_user",
    timestamp: new Date().setHours(hour),
    // ... other fields
  });
}
```

### Dynamic Scenario 3: Multi-Region Attack
```javascript
// Simulate rapid logins from different regions
const regions = ["US-East", "EU-Central", "AP-South"];
for (const region of regions) {
  await evaluateLogin({
    userId: "target_user",
    ipAddress: getIPForRegion(region),
    // ... other fields
  });
}
```

---

## 📈 Expected Results Summary

| Scenario | Risk Score | Decision | Key Signal |
|----------|-----------|----------|------------|
| Normal Login | 0-30 | allow | All signals low |
| New Device | 31-70 | mfa | Device Novelty > 0 |
| Geo Anomaly | 31-70 | mfa | Geographic Anomaly > 0 |
| Failed Attempts | 71-100 | mfa/block | Failed Attempts > 50 |
| Privileged User | Higher | mfa/block | Privilege multiplier |
| Multi-Factor | 71-100 | block | Multiple signals > 50 |
| New User | 0-30 | allow | Neutral baseline |

---

## 🎯 Success Criteria

Your system is working correctly if:

1. ✅ **Risk scores are consistent** - Same input = same score
2. ✅ **Decisions map correctly** - Risk ranges match decisions
3. ✅ **Baselines update** - User profiles change over time
4. ✅ **Explanations are clear** - Every decision has reasoning
5. ✅ **Performance is good** - < 500ms per evaluation
6. ✅ **Dashboard updates** - Real-time data display
7. ✅ **Database persists** - Events saved correctly

Run these test cases and verify each one! 🚀
