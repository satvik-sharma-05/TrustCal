/**
 * Feature extraction for login events. Delegates to ML feature engineering.
 * Produces numeric vector for Isolation Forest (no manual risk stacking).
 */
const { getFeatureVector, getFeatureMap, FEATURE_NAMES } = require('../ml/featureEngineering');

module.exports = {
  getFeatureVector,
  getFeatureMap,
  FEATURE_NAMES,
};
