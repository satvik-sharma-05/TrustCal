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
 * Extract region from IP.
 * When GEOIP_SERVICE_URL env is set, use that service (real GeoIP).
 * Otherwise derives a deterministic region label from IP hash for consistency (no PII stored).
 */
async function extractRegionAsync(ipAddress) {
  const geoipUrl = process.env.GEOIP_SERVICE_URL;
  if (geoipUrl && ipAddress && ipAddress !== '0.0.0.0') {
    try {
      const axios = require('axios');
      const res = await axios.get(`${geoipUrl.replace(/\/$/, '')}/${ipAddress}`, { timeout: 2000 });
      const region = res.data?.region || res.data?.country_code || res.data?.country;
      if (region) return String(region);
    } catch (_) {}
  }
  return extractRegionFromHash(ipAddress);
}

function extractRegionFromHash(ipAddress) {
  const hash = crypto.createHash('md5');
  hash.update(ipAddress || '0.0.0.0');
  const hashHex = hash.digest('hex');
  const regions = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'AP-South', 'AP-North'];
  const index = parseInt(hashHex.substring(0, 2), 16) % regions.length;
  return regions[index];
}

function extractRegion(ipAddress) {
  return extractRegionFromHash(ipAddress);
}

module.exports = {
  hashUserId,
  maskDeviceId,
  extractRegion,
  extractRegionFromHash,
  extractRegionAsync,
};
