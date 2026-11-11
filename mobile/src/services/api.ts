import axios from 'axios';
import { setOnline } from './connection';
import type { AxiosResponse } from 'axios';
import type {
  ApiEnvelope, Church, ChurchDetail, MassWithChurch, Mass, NearbyResult, NewsItem, PriestDetail, PriestListItem,
} from '../types';

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
const unwrap = <T,>(response: AxiosResponse<ApiEnvelope<T>>): T => response.data.data;

// Churches
export const getChurches = async (): Promise<Church[]> => {
  const response = await api.get<ApiEnvelope<Church[]>>('/api/churches');
  return unwrap(response);
};

export const getChurchById = async (id: number): Promise<ChurchDetail> => {
  const response = await api.get<ApiEnvelope<ChurchDetail>>(`/api/churches/${id}`);
  return unwrap(response);
};

export const getNearbyChurches = async (latitude: number, longitude: number): Promise<NearbyResult> => {
  const response = await api.get<NearbyResult>('/api/churches/nearby', {
    params: { lat: latitude, lng: longitude },
  });
  return response.data;
};

// Priests
export const getPriests = async (): Promise<PriestListItem[]> => {
  const response = await api.get<ApiEnvelope<PriestListItem[]>>('/api/priests');
  return unwrap(response);
};

export const getPriestById = async (id: number): Promise<PriestDetail> => {
  const response = await api.get<ApiEnvelope<PriestDetail>>(`/api/priests/${id}`);
  return unwrap(response);
};

// Masses
export const getMasses = async (): Promise<MassWithChurch[]> => {
  const response = await api.get<ApiEnvelope<MassWithChurch[]>>('/api/masses');
  return unwrap(response);
};

export const getMassesByChurch = async (churchId: number): Promise<Mass[]> => {
  const response = await api.get<ApiEnvelope<Mass[]>>(`/api/masses/by-church/${churchId}`);
  return unwrap(response);
};

export const getMassesByDay = async (day: string): Promise<MassWithChurch[]> => {
  const response = await api.get<ApiEnvelope<MassWithChurch[]>>(`/api/masses/by-day/${day}`);
  return unwrap(response);
};

// News
export const getNews = async (): Promise<NewsItem[]> => {
  const response = await api.get<ApiEnvelope<NewsItem[]>>('/api/news');
  return unwrap(response) || [];
};

export const pingApi = () => api.get('/api/health', { timeout: 5000 });

export default api;
