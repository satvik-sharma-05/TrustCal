const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/api'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

const PORT = process.env.BACKEND_PORT || 5000;

async function start() {
  await connectDB();

  // Sync model metadata from ML server to MongoDB (non-blocking)
  (async () => {
    try {
      const mlClient = require('./ml/mlClient');
      const ModelMetadata = require('./models/ModelMetadata');
      const loaded = await mlClient.healthCheck();
      if (loaded) {
        const meta = await mlClient.getMetadata();
        if (meta) {
          await ModelMetadata.findOneAndUpdate(
            { modelVersion: meta.modelVersion },
            { ...meta, updatedAt: new Date() },
            { upsert: true, new: true }
          );
        }
      }
    } catch (e) {
      // ML server may not be running
    }
  })();

  const server = app.listen(PORT, () => {
    console.log(`TrustCal ML Backend: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  require('./services/socket').init(server);
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
