const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch (error) {
    return fallback;
  }
};

// Leitura em cache invalidada pelo mtime (checado no máximo a cada `ttlMs`): o scraper pode
// atualizar os JSONs com a API no ar, sem reinício e sem reler o disco a cada requisição.
const cache = new Map();
const readCached = (file, fallback, ttlMs = 2000) => {
  const entry = cache.get(file);
  const now = Date.now();
  if (entry && now - entry.checkedAt < ttlMs) return entry.data;
  let mtimeMs = 0;
  try {
    mtimeMs = fs.statSync(path.join(DATA_DIR, file)).mtimeMs;
  } catch (error) {
    // arquivo ausente: usa o fallback
  }
  if (entry && entry.mtimeMs === mtimeMs) {
    entry.checkedAt = now;
    return entry.data;
  }
  const data = readJson(file, fallback);
  cache.set(file, { data, mtimeMs, checkedAt: now });
  return data;
};

// Escrita atômica (arquivo temporário + rename): leitores nunca veem JSON pela metade.
const writeJson = (file, data) => {
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
const writeIfSane = (file, data, { minRatio = 0.6, log = console } = {}) => {
  const previous = readJson(file, []);
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

const updatedAt = (file) => {
  try {
    return fs.statSync(path.join(DATA_DIR, file)).mtime.toISOString();
  } catch (error) {
    return null;
  }
};

module.exports = { DATA_DIR, readJson, readCached, writeJson, writeIfSane, updatedAt };
