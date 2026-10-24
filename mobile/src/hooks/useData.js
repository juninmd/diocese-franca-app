import { useCallback } from 'react';
import { useResource } from './useResource';
import { TTL } from '../services/cache';
import { getChurches, getChurchById, getPriests, getPriestById, getMasses, getNews } from '../services/api';

// Catálogo muda só quando o scraper roda; notícias com mais frequência.
export const useChurches = () => useResource('churches', getChurches, { ttl: TTL.normal });
export const usePriests = () => useResource('priests', getPriests, { ttl: TTL.normal });
export const useMasses = () => useResource('masses', getMasses, { ttl: TTL.normal });
export const useNews = () => useResource('news', getNews, { ttl: TTL.short });

export function useChurch(id) {
  const fetcher = useCallback(() => getChurchById(id), [id]);
  return useResource(`church:${id}`, fetcher, { ttl: TTL.short });
}

export function usePriest(id) {
  const fetcher = useCallback(() => getPriestById(id), [id]);
  return useResource(`priest:${id}`, fetcher, { ttl: TTL.normal });
}
