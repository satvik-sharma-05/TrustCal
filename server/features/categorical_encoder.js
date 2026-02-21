/**
 * Categorical encodings for device type, user type, and region.
 * Used by feature extractor; no risk weights – ML learns from distribution.
 */
const {
  REGIONS,
  USER_TYPE_ENCODING,
  DEVICE_TYPE_ENCODING,
  ROLE_IMPORTANCE,
} = require('../ml/featureNames');

function encodeUserType(userType) {
  return USER_TYPE_ENCODING[userType] ?? 0.2;
}

function encodeDeviceType(deviceType) {
  return DEVICE_TYPE_ENCODING[deviceType] ?? 0.5;
}

function encodeRegion(region) {
  const i = REGIONS.indexOf(region);
  return i >= 0 ? i / Math.max(REGIONS.length - 1, 1) : 0.5;
}

function getRoleImportance(role) {
  return ROLE_IMPORTANCE[role] ?? 0.2;
}

module.exports = {
  encodeUserType,
  encodeDeviceType,
  encodeRegion,
  getRoleImportance,
  REGIONS,
  USER_TYPE_ENCODING,
  DEVICE_TYPE_ENCODING,
};
