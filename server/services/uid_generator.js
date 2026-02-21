const crypto = require('crypto');

/**
 * Generate a unique userId when none is provided.
 * Uses UUID format (RFC 4122) for compatibility and uniqueness.
 * @param {Object} rawEvent - Login event payload (userId optional)
 * @returns {string} userId - Provided or generated UUID
 */
function generateUID(rawEvent) {
  if (rawEvent.userId != null && String(rawEvent.userId).trim() !== '') {
    return String(rawEvent.userId).trim();
  }
  return crypto.randomUUID();
}

module.exports = { generateUID };
