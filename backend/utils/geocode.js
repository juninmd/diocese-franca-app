const axios = require('axios');
const { sleep } = require('./http');
const { readJson, writeJson } = require('./fileStore');
const { distanceInKm } = require('./geo');

// Coordenadas por endereço da matriz (OpenStreetMap Nominatim), em cache no repositório
// (data/addressCoords.json, chave = id da paróquia). Portado do bot juninmd/missas-franca:
// antes, todas as paróquias de uma cidade caíam no mesmo ponto (centro da cidade) e o
// "Perto de mim" não distinguia as 24 paróquias de Franca.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'diocese-franca-app/1.0 (+https://github.com/juninmd/diocese-franca-app)';
const MAX_KM_FROM_CITY = 12; // resultado fora da cidade = homônimo em outro lugar, descarta

// "Rua Sacramento, n°605 - Jardim Pedreira" -> "Rua Sacramento 605, Jardim Pedreira"
const cleanAddress = (address) =>
  (address || '')
    .replace(/\bn[°ºo.]\s*/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\bs\/n[º°]?\b/gi, '')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

const orago = (name) => name.replace(/^(Paróquia|Santuário( Diocesano)?|Sé Catedral)\s*/i, '').trim();

const queriesFor = (church) => [
  church.address ? `${cleanAddress(church.address)}, ${church.city}, ${church.state}` : null,
  // só rua + número (o bairro do site às vezes confunde o Nominatim)
  church.address ? `${cleanAddress(church.address.split(/\s+-\s+/)[0])}, ${church.city}, ${church.state}` : null,
  `Igreja ${orago(church.name)}, ${church.city}, ${church.state}`,
  `${church.name}, ${church.city}, ${church.state}`,
].filter((q, i, all) => q && all.indexOf(q) === i);

async function lookup(query, center) {
  const { data } = await axios.get(NOMINATIM, {
    params: { q: query, format: 'json', limit: 3, countrycodes: 'br' },
    headers: { 'User-Agent': USER_AGENT },
    timeout: 20000,
  });
  const hit = (data || [])
    .map((r) => [Number(r.lat), Number(r.lon)])
    .find(([lat, lon]) => !center || distanceInKm(center[0], center[1], lat, lon) <= MAX_KM_FROM_CITY);
  return hit || null;
}

/**
 * Coordenadas por paróquia: { [id]: { address, latitude, longitude } }. Só consulta a rede
 * para paróquias novas ou cujo endereço mudou (respeita 1 req/s do Nominatim).
 * `cityCoords` serve de âncora para validar o resultado.
 */
async function addressCoords(churches, cityCoords = {}, { log = console, delayMs = 1100 } = {}) {
  const cache = readJson('addressCoords.json', {});
  let changed = false;
  for (const church of churches) {
    const key = String(church.id);
    const cached = cache[key];
    if (cached && (cached.address === church.address || cached.manual)) continue;
    const center = cityCoords[`${church.city}|${church.state}`];
    let hit = null;
    for (const query of queriesFor(church)) {
      try {
        hit = await lookup(query, center);
      } catch (error) {
        log.warn(`Geocode falhou para ${church.name}: ${error.message}`);
      }
      await sleep(delayMs);
      if (hit) break;
    }
    if (hit) {
      cache[key] = { address: church.address, latitude: hit[0], longitude: hit[1] };
      changed = true;
    } else if (cached) {
      delete cache[key]; // endereço mudou e o novo não foi encontrado: volta ao centro da cidade
      changed = true;
    }
  }
  if (changed) writeJson('addressCoords.json', cache);
  return cache;
}

module.exports = { addressCoords, cleanAddress, queriesFor, MAX_KM_FROM_CITY };
