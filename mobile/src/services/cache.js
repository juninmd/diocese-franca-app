import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache stale-while-revalidate: memória (instantâneo) + AsyncStorage (sobrevive ao app fechado).
// Dados antigos continuam úteis quando a rede falha; `ttl` só decide quando vale revalidar.
const PREFIX = '@diocese_cache:v1:';
export const TTL = { short: 2 * 60 * 1000, normal: 10 * 60 * 1000, long: 60 * 60 * 1000 };

const memory = new Map(); // key -> { data, savedAt }
const inflight = new Map(); // key -> Promise

const safe = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    return fallback;
  }
};

const isFresh = (entry, ttl) => !!entry && Date.now() - entry.savedAt < ttl;

/** Leitura síncrona da memória (para evitar piscar um skeleton ao voltar a uma tela). */
export const peek = (key) => memory.get(key) || null;

/** Lê da memória ou do disco. */
export async function read(key) {
  if (memory.has(key)) return memory.get(key);
  const raw = await safe(() => AsyncStorage.getItem(PREFIX + key));
  const entry = raw ? await safe(async () => JSON.parse(raw)) : null;
  if (entry && 'data' in entry && typeof entry.savedAt === 'number') {
    memory.set(key, entry);
    return entry;
  }
  return null;
}

async function write(key, data) {
  const entry = { data, savedAt: Date.now() };
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
export async function fetchCached(key, fetcher, { ttl = TTL.normal, force = false } = {}) {
  const cached = await read(key);
  if (!force && isFresh(cached, ttl)) return { data: cached.data, savedAt: cached.savedAt, fromCache: true, stale: false };

  if (!inflight.has(key)) {
    inflight.set(key, fetcher().then((data) => write(key, data)).finally(() => inflight.delete(key)));
  }
  try {
    const entry = await inflight.get(key);
    return { data: entry.data, savedAt: entry.savedAt, fromCache: false, stale: false };
  } catch (error) {
    if (cached) return { data: cached.data, savedAt: cached.savedAt, fromCache: true, stale: true };
    throw error;
  }
}

export async function invalidate(key) {
  memory.delete(key);
  await safe(() => AsyncStorage.removeItem(PREFIX + key));
}

export async function clearAll() {
  memory.clear();
  const keys = await safe(() => AsyncStorage.getAllKeys(), []);
  await safe(() => AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX))));
}
