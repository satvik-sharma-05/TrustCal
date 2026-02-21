import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const evaluateLogin = async (eventData) => {
  const response = await api.post('/evaluate', eventData);
  return response.data;
};

export const getEvents = async (page = 1, limit = 50) => {
  const response = await api.get('/events', {
    params: { page, limit },
  });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const getMLStatus = async () => {
  const response = await api.get('/ml/status');
  return response.data;
};

export default api;
