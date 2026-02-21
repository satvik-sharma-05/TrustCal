# MongoDB Atlas Setup Checklist

## ✅ Connection String Configuration

Your `.env` file should have:
```env
MONGO_URI=mongodb+srv://satvik:YOUR_PASSWORD@cluster0.ncnnre5.mongodb.net/trustcal?retryWrites=true&w=majority
```

**Status**: ✅ Configured correctly

## ⚠️ Important: Network Access Configuration

MongoDB Atlas **blocks all connections by default** for security. You MUST allow your IP address:

### Steps to Allow Network Access:

1. **Go to MongoDB Atlas Dashboard**
   - Navigate to: **Security** → **Database & Network Access** (or **Network Access**)

2. **Add IP Address**
   - Click **"Add IP Address"** button
   - Choose one of:
     - **"Add Current IP Address"** (recommended for development)
     - **"Allow Access from Anywhere"** (0.0.0.0/0) - Only for testing, NOT for production

3. **Save**
   - Click **"Confirm"** or **"Add"**

### For Development/Testing:
- Use **"Add Current IP Address"** - This adds your current IP
- If your IP changes (e.g., different WiFi), you'll need to add it again

### For Quick Testing:
- Temporarily use **"Allow Access from Anywhere"** (0.0.0.0/0)
- ⚠️ **Remove this after testing** - it's insecure for production

## 🔍 Verify Connection

After configuring network access, restart your server:

```bash
npm run server
```

You should see:
```
MongoDB Atlas Connected: cluster0-shard-00-00.ncnnre5.mongodb.net
TrustCal Backend running on port 5000
```

If you still see connection errors:
1. Check Network Access settings in Atlas
2. Verify your password is correct
3. Check if your IP address is whitelisted
4. Try "Allow Access from Anywhere" temporarily to test

## 📝 Database User

Make sure you have a database user created:
- **Security** → **Database Access** → **Add New Database User**
- Username: `satvik` (or your username)
- Password: The one you're using in MONGO_URI
- Database User Privileges: **"Atlas admin"** or **"Read and write to any database"**

## ✅ Quick Test

Once network access is configured, test the connection:

```bash
node test-api.js
```

Or manually:
```bash
curl http://localhost:5000/health
```

## Common Issues

### "MongoServerError: Authentication failed"
- Wrong password in MONGO_URI
- Database user doesn't exist
- Check **Security** → **Database Access**

### "querySrv ENOTFOUND" or "getaddrinfo ENOTFOUND"
- Network access not configured
- IP address not whitelisted
- Check **Security** → **Network Access**

### "MongoNetworkError: connect ETIMEDOUT"
- Firewall blocking connection
- Network access not configured
- Try adding 0.0.0.0/0 temporarily to test
