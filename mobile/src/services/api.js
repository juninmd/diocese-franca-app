import axios from 'axios';
import { setOnline } from './connection';

// Produção: API publicada no cluster (manifestos em juninmd/app-charts/diocese-franca).
// Na web servida em localhost (dev/E2E) usa a API local na porta 3000.
const PROD_API = 'https://diocese-franca.antonio-code.duckdns.org';
const isLocalWeb = typeof window !== 'undefined' && window.location && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname || '');
const API_BASE_URL = isLocalWeb || (typeof __DEV__ !== 'undefined' && __DEV__) ? 'http://localhost:3000' : PROD_API;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Conectividade inferida das respostas: sem resposta (rede/timeout) = offline; qualquer resposta HTTP = online.
api.interceptors.response.use(
  (response) => {
    setOnline(true);
    return response;
  },
  (error) => {
    if (!error.response) setOnline(false);
    else setOnline(true);
    return Promise.reject(error);
  },
);

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
  return unwrap(response) || [];
};

export const pingApi = () => api.get('/api/health', { timeout: 5000 });

export default api;
