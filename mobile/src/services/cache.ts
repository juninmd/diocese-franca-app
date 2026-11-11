import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache stale-while-revalidate: memória (instantâneo) + AsyncStorage (sobrevive ao app fechado).
// Dados antigos continuam úteis quando a rede falha; `ttl` só decide quando vale revalidar.
const PREFIX = '@diocese_cache:v1:';
export const TTL = { short: 2 * 60 * 1000, normal: 10 * 60 * 1000, long: 60 * 60 * 1000 };

export interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

export interface CachedResult<T> extends CacheEntry<T> {
  fromCache: boolean;
  stale: boolean;
}

export interface FetchOptions {
  ttl?: number;
  force?: boolean;
}

// Guardam qualquer tipo; cada chave sempre recebe o mesmo tipo de dado (garantido pelos hooks em useData).
const memory = new Map<string, CacheEntry<unknown>>(); // key -> { data, savedAt }
const inflight = new Map<string, Promise<CacheEntry<unknown>>>(); // key -> Promise

async function safe<T>(fn: () => Promise<T>): Promise<T | null>;
async function safe<T, F>(fn: () => Promise<T>, fallback: F): Promise<T | F>;
async function safe<T>(fn: () => Promise<T>, fallback: unknown = null) {
  try {
    return await fn();
  } catch (error) {
    return fallback;
  }
}

const isFresh = <T,>(entry: CacheEntry<T> | null, ttl: number): entry is CacheEntry<T> => !!entry && Date.now() - entry.savedAt < ttl;

/** Leitura síncrona da memória (para evitar piscar um skeleton ao voltar a uma tela). */
export const peek = <T,>(key: string): CacheEntry<T> | null => (memory.get(key) as CacheEntry<T> | undefined) || null;

/** Lê da memória ou do disco. */
export async function read<T>(key: string): Promise<CacheEntry<T> | null> {
  if (memory.has(key)) return memory.get(key) as CacheEntry<T>;
  const raw = await safe(() => AsyncStorage.getItem(PREFIX + key));
  const entry: unknown = raw ? await safe(async () => JSON.parse(raw) as unknown) : null;
  if (entry && typeof entry === 'object' && 'data' in entry && 'savedAt' in entry && typeof entry.savedAt === 'number') {
    const valid = entry as CacheEntry<T>;
    memory.set(key, valid);
    return valid;
  }
  return null;
}

async function write<T>(key: string, data: T): Promise<CacheEntry<T>> {
  const entry: CacheEntry<T> = { data, savedAt: Date.now() };
  memory.set(key, entry);
  await safe(() => AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry)));
  return entry;
}

/**
 * Busca com cache. Retorna `{ data, savedAt, fromCache, stale }`:
 *  - dado fresco no cache  -> sem rede (fromCache);
 *  - expirado ou `force`   -> rede; se falhar e houver cópia, devolve a cópia com `stale: true`;
 *  - sem cópia e sem rede  -> propaga o erro.
 * Chamadas simultâneas à mesma chave compartilham a mesma requisição.
 */
export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  { ttl = TTL.normal, force = false }: FetchOptions = {},
): Promise<CachedResult<T>> {
  const cached = await read<T>(key);
  if (!force && isFresh(cached, ttl)) return { data: cached.data, savedAt: cached.savedAt, fromCache: true, stale: false };

  if (!inflight.has(key)) {
    inflight.set(key, fetcher().then((data) => write(key, data)).finally(() => inflight.delete(key)));
  }
  try {
    const entry = (await inflight.get(key)) as CacheEntry<T>;
    return { data: entry.data, savedAt: entry.savedAt, fromCache: false, stale: false };
  } catch (error) {
    if (cached) return { data: cached.data, savedAt: cached.savedAt, fromCache: true, stale: true };
    throw error;
  }
}

export async function invalidate(key: string): Promise<void> {
  memory.delete(key);
  await safe(() => AsyncStorage.removeItem(PREFIX + key));
}

export async function clearAll(): Promise<void> {
  memory.clear();
  const keys = await safe(() => AsyncStorage.getAllKeys(), []);
  await safe(() => AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX))));
}
