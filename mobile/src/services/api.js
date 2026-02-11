import axios from 'axios';

// Update this URL to your backend API URL
// For development, you can use: http://localhost:3000
// For production, use your deployed backend URL
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Churches
export const getChurches = async () => {
  const response = await api.get('/api/churches');
  return response.data;
};

export const getChurchById = async (id) => {
  const response = await api.get(`/api/churches/${id}`);
  return response.data;
};

// Priests
export const getPriests = async () => {
  const response = await api.get('/api/priests');
  return response.data;
};

export const getPriestById = async (id) => {
  const response = await api.get(`/api/priests/${id}`);
  return response.data;
};

// Masses
export const getMasses = async () => {
  const response = await api.get('/api/masses');
  return response.data;
};

export const getMassesByChurch = async (churchId) => {
  const response = await api.get(`/api/masses/by-church/${churchId}`);
  return response.data;
};

export const getMassesByDay = async (day) => {
  const response = await api.get(`/api/masses/by-day/${day}`);
  return response.data;
};

export default api;
