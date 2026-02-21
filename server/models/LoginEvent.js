const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema({
  signals: [{ name: String, value: Number, weight: Number, contribution: Number, description: String }],
  summary: String,
  riskFactors: [String],
  confidence: Number,
  topContributingFeatures: [{ name: String, value: Number, contribution: Number }]
}, { _id: false });

const loginEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  region: { type: String, required: true },
  deviceId: { type: String, required: true },
  deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet', 'server', 'unknown', 'laptop', 'workstation', 'vm', 'kiosk', 'iot'], default: 'unknown' },
  role: {
    type: String,
    required: true,
    enum: ['user', 'employee', 'admin', 'super_admin', 'guest', 'contractor', 'viewer', 'developer', 'manager', 'vendor', 'service_account']
  },
  userType: {
    type: String,
    enum: ['employee', 'admin', 'super_admin', 'guest', 'contractor', 'viewer', 'developer', 'manager', 'vendor', 'service_account'],
    default: 'employee'
  },
  isNewUser: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0, min: 0 },
  riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
  anomalyScore: { type: Number, min: 0, max: 1 },
  features: { type: [Number], select: false },
  featureVector: { type: [Number], select: false },
  decision: { type: String, required: true, enum: ['allow', 'mfa', 'block'] },
  explanation: { type: explanationSchema, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

loginEventSchema.index({ userId: 1, timestamp: -1 });
loginEventSchema.index({ riskScore: -1, createdAt: -1 });
loginEventSchema.index({ decision: 1, createdAt: -1 });

module.exports = mongoose.model('LoginEvent', loginEventSchema);
