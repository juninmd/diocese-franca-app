import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCached, peek, read, TTL } from '../services/cache';
import type { CachedResult } from '../services/cache';

export interface ResourceOptions {
  ttl?: number;
  enabled?: boolean;
}

export interface LoadOptions {
  force?: boolean;
  silent?: boolean;
}

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  stale: boolean;
  /** Erro da última tentativa (qualquer valor lançado pelo fetcher). */
  error: unknown;
  savedAt: number | null;
}

export interface Resource<T> extends ResourceState<T> {
  reload: (options?: LoadOptions) => Promise<CachedResult<T> | null>;
}

/**
 * Recurso remoto com cache stale-while-revalidate.
 *  - mostra imediatamente o que houver em cache (memória ou disco) e revalida em segundo plano;
 *  - `stale` = os dados exibidos vêm de uma cópia antiga porque a rede falhou;
 *  - `error` só aparece quando não há nenhum dado para mostrar.
 * `reload({ force: true })` ignora o TTL (pull-to-refresh).
 */
export function useResource<T>(key: string, fetcher: () => Promise<T>, { ttl = TTL.normal, enabled = true }: ResourceOptions = {}): Resource<T> {
  const initial = peek<T>(key);
  const [state, setState] = useState<ResourceState<T>>({
    data: initial ? initial.data : null,
    loading: enabled && !initial,
    refreshing: false,
    stale: false,
    error: null,
    savedAt: initial ? initial.savedAt : null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);

  const load = useCallback(async ({ force = false, silent = false }: LoadOptions = {}): Promise<CachedResult<T> | null> => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: s.data === null && !silent, refreshing: s.data !== null && force, error: null }));
    try {
      const result = await fetchCached<T>(key, () => fetcherRef.current(), { ttl, force });
      if (id !== requestId.current) return result;
      setState({ data: result.data, loading: false, refreshing: false, stale: result.stale, error: null, savedAt: result.savedAt });
      return result;
    } catch (error) {
      if (id !== requestId.current) return null;
      setState((s) => ({ ...s, loading: false, refreshing: false, error }));
      return null;
    }
  }, [key, ttl]);

  useEffect(() => {
    if (!enabled) return undefined;
    const cached = peek<T>(key);
    setState((s) => (cached ? { ...s, data: cached.data, savedAt: cached.savedAt, loading: false } : { ...s, data: null, loading: true }));
    let active = true;
    // Disco primeiro (mostra algo já na abertura do app), depois a revalidação.
    read<T>(key).then((entry) => {
      if (active && entry) setState((s) => (s.data === null ? { ...s, data: entry.data, savedAt: entry.savedAt, loading: false } : s));
      if (active) load();
    });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, [key, enabled, load]);

  const reload = useCallback((options?: LoadOptions) => load({ force: true, ...options }), [load]);
  return { ...state, reload };
}
