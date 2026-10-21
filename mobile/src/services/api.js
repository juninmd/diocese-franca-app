import axios from 'axios';

// Update this URL to your backend API URL
// For development, you can use: http://localhost:3000
// For production, use your deployed backend URL
const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// O backend responde { success, count, data }; as telas esperam o payload direto.
const unwrap = (response) => response.data.data;

// Churches
export const getChurches = async () => {
  const response = await api.get('/api/churches');
  return unwrap(response);
};

export const getChurchById = async (id) => {
  const response = await api.get(`/api/churches/${id}`);
  return unwrap(response);
};

export const getNearbyChurches = async (latitude, longitude) => {
  const response = await api.get('/api/churches/nearby', {
    params: { lat: latitude, lng: longitude },
  });
  return response.data;
};

// Priests
export const getPriests = async () => {
  const response = await api.get('/api/priests');
  return unwrap(response);
};

export const getPriestById = async (id) => {
  const response = await api.get(`/api/priests/${id}`);
  return unwrap(response);
};

// Masses
export const getMasses = async () => {
  const response = await api.get('/api/masses');
  return unwrap(response);
};

export const getMassesByChurch = async (churchId) => {
  const response = await api.get(`/api/masses/by-church/${churchId}`);
  return unwrap(response);
};

export const getMassesByDay = async (day) => {
  const response = await api.get(`/api/masses/by-day/${day}`);
  return unwrap(response);
};

// News
export const getNews = async () => {
  const response = await api.get('/api/news');
  return response.data;
};

export default api;
