import fs from 'fs';
import path from 'path';

// src/utils e dist/utils ficam na mesma profundidade: os dois apontam para backend/data.
export const DATA_DIR = path.join(__dirname, '..', '..', 'data');

export function readJson<T>(file: string, fallback: T): T;
export function readJson<T = unknown>(file: string): T | undefined;
export function readJson<T>(file: string, fallback?: T): T | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

// Leitura em cache invalidada pelo mtime (checado no máximo a cada `ttlMs`): o scraper pode
// atualizar os JSONs com a API no ar, sem reinício e sem reler o disco a cada requisição.
interface CacheEntry {
  data: unknown;
  mtimeMs: number;
  checkedAt: number;
}
const cache = new Map<string, CacheEntry>();

export const readCached = <T>(file: string, fallback: T, ttlMs = 2000): T => {
  const entry = cache.get(file);
  const now = Date.now();
  if (entry && now - entry.checkedAt < ttlMs) return entry.data as T;
  let mtimeMs = 0;
  try {
    mtimeMs = fs.statSync(path.join(DATA_DIR, file)).mtimeMs;
  } catch {
    // arquivo ausente: usa o fallback
  }
  if (entry && entry.mtimeMs === mtimeMs) {
    entry.checkedAt = now;
    return entry.data as T;
  }
  const data = readJson(file, fallback);
  cache.set(file, { data, mtimeMs, checkedAt: now });
  return data;
};

// Escrita atômica (arquivo temporário + rename): leitores nunca veem JSON pela metade.
export const writeJson = (file: string, data: unknown): void => {
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmp, target);
};

/**
 * Só substitui o arquivo quando o novo conjunto parece íntegro: não vazio e sem
 * encolher além de `minRatio` do anterior (site fora do ar / layout alterado).
 * Retorna true se gravou.
 */
export const writeIfSane = (
  file: string,
  data: readonly unknown[],
  { minRatio = 0.6, log = console }: { minRatio?: number; log?: Pick<Console, 'warn'> } = {}
): boolean => {
  const previous = readJson<unknown[]>(file, []);
  if (!data.length) {
    log.warn(`${file}: 0 registros, mantendo o arquivo atual.`);
    return false;
  }
  if (previous.length && data.length < previous.length * minRatio) {
    log.warn(`${file}: ${data.length} registros contra ${previous.length} atuais (< ${minRatio * 100}%), mantendo o arquivo atual.`);
    return false;
  }
  writeJson(file, data);
  return true;
};

export const updatedAt = (file: string): string | null => {
  try {
    return fs.statSync(path.join(DATA_DIR, file)).mtime.toISOString();
  } catch {
    return null;
  }
};
