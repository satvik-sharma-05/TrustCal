/**
 * Client for Python ML inference server. Calls /predict with feature vector.
 */
const axios = require('axios');

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://127.0.0.1:5001';

async function predict(features) {
  const response = await axios.post(
    `${ML_SERVER_URL}/predict`,
    { features },
    { timeout: 5000 }
  );
  return response.data;
}

async function healthCheck() {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/health`, { timeout: 2000 });
    return response.data.model_loaded === true;
  } catch (err) {
    return false;
  }
}

async function getMetadata() {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/metadata`, { timeout: 2000 });
    return response.data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  predict,
  healthCheck,
  getMetadata,
};
