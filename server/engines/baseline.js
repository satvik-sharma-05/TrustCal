const UserProfile = require('../models/UserProfile');

const LEARNING_RATE = 0.1;
const MIN_LOGINS_FOR_RELIABLE = 5;
const MAX_ROLE_HISTORY = 10;
const MAX_REGIONS = 15;
const MAX_DEVICES = 15;

/**
 * Get or create user profile. New users get neutral baseline; baselineReliable = false until MIN_LOGINS.
 */
async function getUserProfile(userId) {
  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = new UserProfile({
      userId,
      avgLoginHour: 12,
      loginHourVariance: 4.0,
      knownRegions: [],
      knownDevices: [],
      roleHistory: [],
      loginFrequency: 1.0,
      failedAttemptTrend: 0.0,
      totalLogins: 0,
      baselineReliable: false,
    });
    await profile.save();
  }
  return profile;
}

/**
 * Update baseline after login. Persist device/region/role history.
 */
async function updateBaseline(userId, event) {
  const profile = await getUserProfile(userId);
  const loginHour = new Date(event.timestamp).getHours();
  const isNewRegion = !profile.knownRegions.includes(event.region);
  const isNewDevice = !profile.knownDevices.includes(event.deviceId);

  const alpha = LEARNING_RATE;
  const oldAvg = profile.avgLoginHour;
  profile.avgLoginHour = (1 - alpha) * profile.avgLoginHour + alpha * loginHour;

  const deviation = Math.abs(loginHour - oldAvg);
  const newDeviation = Math.abs(loginHour - profile.avgLoginHour);
  const varianceUpdate = alpha * (newDeviation - profile.loginHourVariance);
  profile.loginHourVariance = Math.max(2.0, Math.min(8.0, profile.loginHourVariance + varianceUpdate));

  if (isNewRegion && !profile.knownRegions.includes(event.region)) {
    profile.knownRegions.push(event.region);
    if (profile.knownRegions.length > MAX_REGIONS) profile.knownRegions.shift();
  }
  if (isNewDevice && !profile.knownDevices.includes(event.deviceId)) {
    profile.knownDevices.push(event.deviceId);
    if (profile.knownDevices.length > MAX_DEVICES) profile.knownDevices.shift();
  }

  const role = event.role || event.userType || 'user';
  profile.roleHistory = profile.roleHistory || [];
  profile.roleHistory.push(role);
  if (profile.roleHistory.length > MAX_ROLE_HISTORY) profile.roleHistory.shift();

  const now = new Date();
  const daysSinceLastUpdate = (now - profile.lastUpdated) / (1000 * 60 * 60 * 24);
  if (daysSinceLastUpdate > 0) {
    const currentFrequency = profile.totalLogins / Math.max(daysSinceLastUpdate, 1);
    profile.loginFrequency = (1 - alpha) * profile.loginFrequency + alpha * currentFrequency;
  }
  profile.failedAttemptTrend = (1 - alpha) * profile.failedAttemptTrend + alpha * (event.failedAttempts ?? 0);
  profile.totalLogins += 1;
  profile.lastUpdated = now;
  profile.baselineReliable = profile.totalLogins >= MIN_LOGINS_FOR_RELIABLE;
  await profile.save();
  return profile;
}

function isBaselineReliable(profile) {
  return profile && profile.totalLogins >= MIN_LOGINS_FOR_RELIABLE;
}

module.exports = {
  getUserProfile,
  updateBaseline,
  isBaselineReliable,
};
