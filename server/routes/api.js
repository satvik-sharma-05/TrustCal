const express = require('express');
const router = express.Router();
const EvaluationService = require('../services/evaluation');
const LoginEvent = require('../models/LoginEvent');
const UserProfile = require('../models/UserProfile');
const { hashUserId } = require('../utils/crypto');
const mlClient = require('../ml/mlClient');

/**
 * POST /api/evaluate
 * Evaluate a login event (ML-only)
 */
router.post('/evaluate', async (req, res) => {
  try {
    const result = await EvaluationService.evaluateLogin(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/events
 * Get login events with pagination
 */
router.get('/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const events = await LoginEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await LoginEvent.countDocuments();

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalLogins = await LoginEvent.countDocuments();
    const highRiskCount = await LoginEvent.countDocuments({ riskScore: { $gte: 71 } });
    const mfaCount = await LoginEvent.countDocuments({ decision: 'mfa' });
    const blockCount = await LoginEvent.countDocuments({ decision: 'block' });
    const allowCount = await LoginEvent.countDocuments({ decision: 'allow' });

    const recentEvents = await LoginEvent.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('riskScore anomalyScore createdAt decision')
      .lean();

    const avgRisk = recentEvents.length > 0
      ? recentEvents.reduce((sum, e) => sum + (e.riskScore || 0), 0) / recentEvents.length
      : 0;

    const highRiskPct = totalLogins > 0 ? (highRiskCount / totalLogins) * 100 : 0;

    res.json({
      totalLogins,
      highRiskCount,
      avgRisk: Math.round(avgRisk * 10) / 10,
      highRiskPct: Math.round(highRiskPct * 10) / 10,
      decisions: {
        allow: allowCount,
        mfa: mfaCount,
        block: blockCount
      },
      recentEvents: recentEvents.map(e => ({
        riskScore: e.riskScore,
        anomalyScore: e.anomalyScore,
        decision: e.decision,
        timestamp: e.createdAt
      }))
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ml/status
 * Check if ML model is available
 */
router.get('/ml/status', async (req, res) => {
  try {
    const modelLoaded = await mlClient.healthCheck();
    const metadata = await mlClient.getMetadata();
    res.json({
      modelLoaded,
      mlServerUrl: process.env.ML_SERVER_URL || 'http://127.0.0.1:5001',
      modelVersion: metadata?.modelVersion || null,
    });
  } catch (err) {
    res.json({ modelLoaded: false });
  }
});

/**
 * GET /api/model-metadata
 * Return current model metadata
 */
router.get('/model-metadata', async (req, res) => {
  try {
    const ModelMetadata = require('../models/ModelMetadata');
    const meta = await ModelMetadata.findOne().sort({ updatedAt: -1 }).lean();
    if (meta) return res.json(meta);
    const fromServer = await mlClient.getMetadata();
    if (fromServer) return res.json(fromServer);
    res.status(404).json({ error: 'No model metadata available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/profile/:userId
 * Get user profile and risk history
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const param = req.params.userId;
    const isHashed = /^[a-f0-9]{32}$/i.test(param);
    const userId = isHashed ? param : hashUserId(param);

    const profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const events = await LoginEvent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('riskScore anomalyScore decision createdAt explanation')
      .lean();

    res.json({
      profile: {
        ...profile,
        userId: req.params.userId
      },
      recentEvents: events
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/retrain', require('./retrain'));

module.exports = router;
