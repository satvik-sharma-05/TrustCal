const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

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
        // Model metadata synced
      }
    }
  } catch (e) {
    // ML server may not be running
  }
})();

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
const server = app.listen(PORT, () => {
  console.log(`TrustCal ML Backend: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Initialize WebSocket
require('./services/socket').init(server);
