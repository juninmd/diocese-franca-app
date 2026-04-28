import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { api } from '../services/api';

const DataCacheContext = createContext(null);

const CACHE_DURATION = 5 * 60 * 1000;

export function DataCacheProvider({ children }) {
  const [cache, setCache] = useState({});
  const [offline, setOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState(new Date());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      checkConnection();
    }
  };

  const checkConnection = async () => {
    try {
      await api.get('/', { timeout: 3000 });
      setOffline(false);
      setLastOnline(new Date());
    } catch (error) {
      setOffline(true);
    }
  };

  const getCachedData = useCallback((key) => {
    const cached = cache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      return cached.data;
    }
    return cached.data;
  }, [cache]);

  const setCachedData = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  const fetchWithCache = useCallback(async (key, fetchFn, forceRefresh = false) => {
    const cached = getCachedData(key);

    if (cached && !forceRefresh) {
      return { data: cached, fromCache: true };
    }

    try {
      const data = await fetchFn();
      setCachedData(key, data);
      setOffline(false);
      return { data, fromCache: false };
    } catch (error) {
      if (cached) {
        return { data: cached, fromCache: true, stale: true };
      }
      throw error;
    }
  }, [getCachedData, setCachedData]);

  const invalidateCache = useCallback((key) => {
    setCache(prev => {
      const newCache = { ...prev };
      if (key) {
        delete newCache[key];
      }
      return newCache;
    });
  }, []);

  const value = {
    fetchWithCache,
    getCachedData,
    setCachedData,
    invalidateCache,
    offline,
    lastOnline,
    checkConnection
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
}