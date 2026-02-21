const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  avgLoginHour: {
    type: Number,
    default: 12,
    min: 0,
    max: 23
  },
  loginHourVariance: {
    type: Number,
    default: 4.0,
    min: 0
  },
  knownRegions: [{ type: String }],
  knownDevices: [{ type: String }],
  roleHistory: [{ type: String }],
  loginFrequency: {
    type: Number,
    default: 1.0,
    min: 0
  },
  failedAttemptTrend: {
    type: Number,
    default: 0.0,
    min: 0
  },
  lastUpdated: { type: Date, default: Date.now },
  totalLogins: { type: Number, default: 0 },
  baselineReliable: { type: Boolean, default: false }
});

userProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema);
