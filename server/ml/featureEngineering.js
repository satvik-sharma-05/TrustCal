/**
 * Custom evaluation layer: feature engineering only.
 * Normalizes device/user/region into numeric features for Isolation Forest.
 * No manual risk stacking; all risk from model anomaly output.
 */
const {
  FEATURE_NAMES,
  REGIONS,
  ROLE_IMPORTANCE,
  USER_TYPE_ENCODING,
  DEVICE_TYPE_ENCODING,
} = require('./featureNames');

function getFeatureVector(event, profile) {
  const timestamp = new Date(event.timestamp || Date.now());
  const hour = timestamp.getHours();
  const dayOfWeek = timestamp.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1.0 : 0.0;

  const typicalHour = profile.avgLoginHour ?? 12;
  const deviation = Math.min(Math.abs(hour - typicalHour) / 6.0, 1.0);

  const region = event.region || 'US-East';
  const regionIndex = REGIONS.indexOf(region) >= 0 ? REGIONS.indexOf(region) : 0;
  const knownRegions = profile.knownRegions || [];
  const isNewRegion = knownRegions.includes(region) ? 0.0 : 1.0;
  const regionCount = knownRegions.filter(r => r === region).length;
  const regionFreq = knownRegions.length === 0 ? 0.5 : Math.min(1.0, 0.3 + regionCount / Math.max(knownRegions.length, 1));
  const regionRarity = 1.0 - (regionIndex / REGIONS.length) * 0.5;

  const knownDevices = profile.knownDevices || [];
  const deviceId = event.deviceId || '';
  const isNewDevice = knownDevices.includes(deviceId) ? 0.0 : 1.0;
  const deviceSeenNorm = knownDevices.length === 0 ? 0.5 : knownDevices.includes(deviceId)
    ? 0.6 + Math.random() * 0.4
    : 0.0;

  const failedAttempts = event.failedAttempts ?? 0;
  const failedAttemptsNorm = Math.min(failedAttempts / 10.0, 1.0);
  const failedRate = profile.failedAttemptTrend ?? 0.02;

  const lastUpdated = profile.lastUpdated ? new Date(profile.lastUpdated) : null;
  const timeSinceHours = lastUpdated
    ? (timestamp - lastUpdated) / (1000 * 60 * 60)
    : 24 * 7;
  const timeSinceNorm = Math.min(timeSinceHours / 168.0, 1.0);

  const loginFreq = profile.loginFrequency ?? 0.5;
  const loginFreqNorm = Math.min(loginFreq / 5.0, 1.0);

  const userType = event.userType || event.role || 'employee';
  const roleImportance = USER_TYPE_ENCODING[userType] ?? ROLE_IMPORTANCE[event.role] ?? 0.2;

  return [
    hour / 24.0,
    deviation,
    isWeekend,
    regionFreq,
    isNewRegion,
    regionRarity,
    deviceSeenNorm,
    isNewDevice,
    failedAttemptsNorm,
    failedRate,
    timeSinceNorm,
    loginFreqNorm,
    roleImportance,
  ];
}

function getFeatureMap(event, profile) {
  const vec = getFeatureVector(event, profile);
  const map = {};
  FEATURE_NAMES.forEach((name, i) => {
    map[name] = vec[i];
  });
  return map;
}

module.exports = {
  getFeatureVector,
  getFeatureMap,
  FEATURE_NAMES,
};
