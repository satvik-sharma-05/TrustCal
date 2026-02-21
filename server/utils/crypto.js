const crypto = require('crypto');

/**
 * Hash user identifier for privacy
 */
function hashUserId(userId) {
  const hash = crypto.createHash('sha256');
  hash.update(userId);
  return hash.digest('hex').substring(0, 32);
}

/**
 * Mask device identifier
 */
function maskDeviceId(deviceId) {
  const hash = crypto.createHash('sha256');
  hash.update(deviceId);
  return hash.digest('hex').substring(0, 16);
}

/**
 * Extract region from IP (mock - in production use GeoIP service)
 * For now, returns a mock region based on hash
 */
function extractRegion(ipAddress) {
  // In production, use a GeoIP service
  // For now, return mock region based on hash
  const hash = crypto.createHash('md5');
  hash.update(ipAddress);
  const hashHex = hash.digest('hex');
  const regions = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'AP-South', 'AP-North'];
  const index = parseInt(hashHex.substring(0, 2), 16) % regions.length;
  return regions[index];
}

module.exports = {
  hashUserId,
  maskDeviceId,
  extractRegion
};
