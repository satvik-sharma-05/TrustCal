/**
 * TrustCal ML: ML-only evaluation. Risk from Isolation Forest anomaly score.
 * Decision thresholds from env (ALLOW_MAX, MFA_MAX). No rule-based scoring.
 */
const BaselineEngine = require('../engines/baseline');
const LoginEvent = require('../models/LoginEvent');
const { hashUserId, maskDeviceId, extractRegion } = require('../utils/crypto');
const { getFeatureVector } = require('../ml/featureEngineering');
const mlClient = require('../ml/mlClient');
const uidGenerator = require('./uid_generator');

const VALID_USER_TYPES = ['employee', 'admin', 'super_admin', 'guest', 'contractor', 'viewer', 'developer', 'manager', 'vendor', 'service_account'];
const VALID_DEVICE_TYPES = ['mobile', 'desktop', 'tablet', 'server', 'unknown', 'laptop', 'workstation', 'vm', 'kiosk', 'iot'];

function getDecisionThresholds() {
  const allowMax = parseInt(process.env.ALLOW_THRESHOLD || process.env.ALLOW_MAX, 10) || 30;
  const mfaMax = parseInt(process.env.MFA_THRESHOLD || process.env.MFA_MAX, 10) || 70;
  const blockMin = parseInt(process.env.BLOCK_THRESHOLD, 10);
  return { allowMax, mfaMax, blockMin: Number.isNaN(blockMin) ? undefined : blockMin };
}

function riskToDecision(riskScore) {
  const { allowMax, mfaMax } = getDecisionThresholds();
  if (riskScore <= allowMax) return 'allow';
  if (riskScore <= mfaMax) return 'mfa';
  return 'block';
}

function buildExplanation(anomalyScore, riskScore, decision, topContributingFeatures) {
  const top3 = (topContributingFeatures || []).slice(0, 3);
  const riskFactors = top3
    .filter((f) => f.contribution > 0)
    .map((f) => `${f.name} (deviation: ${f.contribution.toFixed(3)})`);
  const summary =
    `Anomaly: ${(anomalyScore * 100).toFixed(1)}% → Risk: ${riskScore}/100. Decision: ${decision}. ` +
    (top3.length ? `Top features: ${top3.map((f) => f.name).join(', ')}.` : 'No feature deviations above threshold.');
  return {
    signals: top3.map((f) => ({
      name: f.name,
      value: f.value,
      weight: 0,
      contribution: f.contribution,
      description: `Feature deviation: ${f.contribution.toFixed(3)}`,
    })),
    summary,
    riskFactors,
    confidence: 0.85,
    topContributingFeatures: top3,
  };
}

function normalizeRole(userType, role) {
  if (userType && VALID_USER_TYPES.includes(userType)) return userType;
  if (role && (VALID_USER_TYPES.includes(role) || role === 'user')) return role === 'user' ? 'employee' : role;
  return 'employee';
}

class EvaluationService {
  validateInput(event) {
    if (event.failedAttempts !== undefined && event.failedAttempts < 0) {
      throw new Error('failedAttempts must be non-negative');
    }
    if (event.userType != null && !VALID_USER_TYPES.includes(event.userType)) {
      throw new Error('Invalid userType');
    }
    if (event.deviceType != null && !VALID_DEVICE_TYPES.includes(event.deviceType)) {
      throw new Error('Invalid deviceType');
    }
  }

  async evaluateLogin(rawEvent) {
    const startTime = Date.now();
    try {
      this.validateInput(rawEvent);

      const modelLoaded = await mlClient.healthCheck();
      if (!modelLoaded) {
        return {
          success: false,
          error: 'ML model not available. Start the model server and run train.py.',
        };
      }

      const userIdGenerated = uidGenerator.generateUID(rawEvent);
      const userId = hashUserId(userIdGenerated);
      const deviceId = maskDeviceId(rawEvent.deviceId || `${userIdGenerated}-device`);
      const region = rawEvent.region || extractRegion(rawEvent.ipAddress || '0.0.0.0');
      const userType = normalizeRole(rawEvent.userType, rawEvent.role);
      const deviceType = VALID_DEVICE_TYPES.includes(rawEvent.deviceType) ? rawEvent.deviceType : 'unknown';
      const isNewUser = Boolean(rawEvent.isNewUser);

      const baseline = await BaselineEngine.getUserProfile(userId);
      const displayName = rawEvent.displayName != null && String(rawEvent.displayName).trim() !== ''
        ? String(rawEvent.displayName).trim() : null;
      const email = rawEvent.email != null && String(rawEvent.email).trim() !== ''
        ? String(rawEvent.email).trim() : null;
      const event = {
        userId,
        displayName,
        email,
        timestamp: new Date(rawEvent.timestamp || Date.now()),
        region,
        deviceId,
        deviceType,
        role: userType,
        userType,
        isNewUser,
        failedAttempts: rawEvent.failedAttempts ?? 0,
      };

      const featureVector = getFeatureVector(event, baseline);
      const mlResult = await mlClient.predict(featureVector);

      const anomalyScore = mlResult.anomaly_score;
      const riskScore = mlResult.risk_score;
      const decision = riskToDecision(riskScore);
      const explanation = buildExplanation(
        anomalyScore,
        riskScore,
        decision,
        mlResult.top_contributing_features
      );

      const loginEvent = new LoginEvent({
        ...event,
        riskScore,
        anomalyScore,
        features: featureVector,
        featureVector,
        decision,
        explanation,
      });

      await Promise.all([
        loginEvent.save(),
        BaselineEngine.updateBaseline(userId, event),
      ]);

      try {
        const socketService = require('./socket');
        socketService.emitEvent('new_login', {
          _id: loginEvent._id,
          userId,
          displayName: displayName || undefined,
          email: email || undefined,
          riskScore,
          anomalyScore,
          decision,
          timestamp: event.timestamp,
          createdAt: loginEvent.createdAt,
          region,
          deviceType: event.deviceType,
          userType: event.userType,
          explanation: explanation.summary,
          topFeatures: mlResult.top_contributing_features,
        });
      } catch (_) {}

      const processingTime = Date.now() - startTime;
      return {
        success: true,
        data: {
          userId: userIdGenerated,
          timestamp: event.timestamp,
          anomalyScore,
          riskScore,
          decision,
          featureContributions: mlResult.top_contributing_features.map((f) => ({
            feature: f.name,
            value: f.value,
            deviationScore: f.contribution,
          })),
          modelConfidence: 0.85,
          processingTimeMs: processingTime,
        },
      };
    } catch (err) {
      console.error('Evaluation error:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EvaluationService();
