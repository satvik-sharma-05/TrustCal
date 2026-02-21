# Starting the Frontend

## Step 1: Install Frontend Dependencies

Open a terminal in the project root and run:

```bash
cd client
npm install
```

This will install all React dependencies including:
- React & React DOM
- Tailwind CSS
- Recharts (for charts)
- Axios (for API calls)
- Lucide React (for icons)

**Wait for installation to complete** (may take 2-5 minutes)

## Step 2: Start the Frontend

After dependencies are installed, run:

```bash
npm start
```

Or if you're in the project root:

```bash
npm run client
```

## Step 3: Access the Dashboard

The frontend will automatically open at:
**http://localhost:3000**

If it doesn't open automatically, manually navigate to that URL in your browser.

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Port 3000 is already in use"
- Close other applications using port 3000
- Or set PORT environment variable: `set PORT=3001` (Windows) then `npm start`

### "Module not found" errors
- Make sure you ran `npm install` in the `client` folder
- Delete `client/node_modules` and `client/package-lock.json` and reinstall

### Frontend loads but shows errors
- Make sure backend is running on port 5000
- Check browser console (F12) for specific errors
- Verify backend is accessible: `curl http://localhost:5000/health`

### Tailwind CSS not working
- Make sure `tailwind.config.js` exists in `client/` folder
- Check that `postcss.config.js` exists
- Restart the dev server

## Quick Commands

**Install dependencies:**
```bash
cd client && npm install
```

**Start frontend:**
```bash
cd client && npm start
```

**Start both backend and frontend together:**
```bash
# From project root
npm run dev
```

## Expected Output

When frontend starts successfully, you should see:
```
Compiled successfully!

You can now view trustcal-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```
