const axios = require('axios');
const { fetchHtml, sleep } = require('./http');
const { parseParish, SITE } = require('./parishParser');
const { htmlToText } = require('./htmlText');
const { readJson, writeJson } = require('./fileStore');

const FIRST_ID = 2014;
const LAST_ID = 2265;
const BISHOP_PAGE_ID = 1865;
const SEAT_ID = 2080; // Sé Catedral
const CONCURRENCY = 6;

const pageUrl = (id) => `${SITE}/?menu=noticia_detalhe&id=${id}&id_orgao=1`;

const ORDERS = 'OFMCap|OFMConv|OFM|OAR|SJS|CSsR|SDB|OSA|OSB|OCD|OMI|MCCJ|SCJ|SVD|MSC|IMC|FDP|SSS|CSS|CP|CM|OP|SJ|SJC';

// "Pe Fulano , sjs" -> "Pe. Fulano, SJS"
const normalizeName = (name) =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(?:Pe\b\.?\s*\.?\s*)+/i, 'Pe. ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*Reitor$/i, '')
    .replace(/,\s*([A-Za-z]{2,5})\s*$/, (_, order) => `, ${order.toUpperCase()}`)
    // "Frei Fulano OFM" -> "Frei Fulano, OFM" (siglas de ordens/congregações conhecidas)
    .replace(new RegExp(`([^\\s,])\\s+(${ORDERS})$`, 'i'), (_, last, order) => `${last}, ${order.toUpperCase()}`)
    .trim();

async function crawlParishes({ firstId = FIRST_ID, lastId = LAST_ID, log = console } = {}) {
  const ids = Array.from({ length: lastId - firstId }, (_, i) => firstId + i);
  const parishes = [];
  const unparsed = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const pages = await Promise.all(ids.slice(i, i + CONCURRENCY).map(async (id) => [id, await fetchHtml(pageUrl(id), { log })]));
    pages.forEach(([id, html]) => {
      const parish = html && parseParish(html, id);
      if (parish) parishes.push(parish);
      else if (html && /Local e Contato/.test(html)) unparsed.push(id); // parecia paróquia mas o parser rejeitou
    });
  }
  if (unparsed.length) log.warn(`Páginas com "Local e Contato" não interpretadas: ${unparsed.join(', ')}`);
  return parishes.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

async function parseBishop(log = console) {
  const html = await fetchHtml(pageUrl(BISHOP_PAGE_ID), { log });
  const text = htmlToText(html);
  const name = (text.match(/Bispo atual\s*-\s*(Dom [^\n]+)/) || [])[1];
  if (!name) return null;
  const born = (text.match(/Nascido em ([^-\n]+)- (\d{2}\/\d{2}\/\d{4})/) || []).slice(1);
  const seat = (text.match(/Nomeado Bispo de Franca[^\n]*\n\s*Posse:\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1];
  const phone = (text.match(/Fone:\s*(\(\d{2}\)\s?\d{4}-\d{4})/) || [])[1];
  const ordinal = (text.match(/(\d+)º Bispo Diocesano/) || [])[1];
  const imgMatch = html.match(/<img src="([^"]+)"[^>]*class="scale_image2"/);
  const image = imgMatch ? `${SITE}/${imgMatch[1]}` : null;
  const bio = [
    `${ordinal ? `${ordinal}º ` : ''}Bispo Diocesano de Franca`,
    born.length ? `nascido em ${born[0].trim()} (${born[1]})` : '',
    seat ? `com posse em ${seat}` : '',
  ].filter(Boolean).join(', ') + '.';
  return { name: name.trim(), phone: phone || null, bio, image };
}

// Coordenadas por cidade (Photon/OpenStreetMap), em cache no repositório. Precisão: cidade.
async function cityCoords(cities, { log = console } = {}) {
  const cache = readJson('cityCoords.json', {});
  let changed = false;
  for (const key of cities) {
    if (cache[key]) continue;
    const [city, state] = key.split('|');
    for (let attempt = 1; attempt <= 4 && !cache[key]; attempt += 1) {
      try {
        const { data } = await axios.get('https://photon.komoot.io/api/', { params: { q: `${city}, ${state}, Brasil`, limit: 3 }, timeout: 8000 });
        const hit = data.features.find((f) => f.properties.countrycode === 'BR');
        if (hit) {
          cache[key] = [hit.geometry.coordinates[1], hit.geometry.coordinates[0]];
          changed = true;
        } else break;
      } catch (error) {
        if (attempt === 4) log.warn(`Sem coordenadas para ${key}: ${error.message}`);
      }
      await sleep(1500);
    }
  }
  if (changed) writeJson('cityCoords.json', cache);
  return cache;
}

// `previousPriests` (priests.json atual) preserva os ids: o app guarda favoritos por id de padre.
function buildCatalog(parishes, coords, bishop, previousPriests = []) {
  const churches = parishes.map(({ sourceId, clergy, masses, ...p }) => {
    const [latitude, longitude] = coords[`${p.city}|${p.state}`] || [null, null];
    return { id: sourceId, ...p, latitude, longitude, coordinatesVerified: false, coordinatesPrecision: 'city' };
  });

  const massList = [];
  parishes.forEach((p) => p.masses.forEach((m) => massList.push({
    id: massList.length + 1,
    churchId: p.sourceId,
    dayOfWeek: m.dayOfWeek,
    time: m.time,
    type: m.dayOfWeek === 'Domingo' ? 'Missa Dominical' : 'Missa Semanal',
  })));

  const knownIds = new Map(previousPriests.map((p) => [p.name, p.id]));
  let nextId = Math.max(0, ...previousPriests.map((p) => p.id)) + 1;
  const idFor = (name) => knownIds.get(name) || nextId++;

  const priests = [];
  if (bishop) {
    priests.push({ id: idFor(bishop.name), name: bishop.name, title: 'Bispo Diocesano', churchId: SEAT_ID, email: null, phone: bishop.phone, bio: bishop.bio, image: bishop.image || null });
  }
  // Um padre pode atender mais de uma paróquia: fica um único registro, com todas em `churchIds`.
  const byName = new Map(priests.map((p) => [p.name, p]));
  priests.forEach((p) => { p.churchIds = [p.churchId]; });
  parishes.forEach((p) => p.clergy.forEach((c) => {
    const name = normalizeName(c.name);
    const known = byName.get(name);
    if (known) {
      if (!known.churchIds.includes(p.sourceId)) known.churchIds.push(p.sourceId);
      return;
    }
    const priest = {
      id: idFor(name), name, title: c.title, churchId: p.sourceId, churchIds: [p.sourceId], email: p.email, phone: p.phone,
      bio: `${c.title} da ${p.name} (${p.city}/${p.state}).`, image: null,
    };
    byName.set(name, priest);
    priests.push(priest);
  }));

  priests.sort((a, b) => a.id - b.id);
  return { churches, masses: massList, priests };
}

/** Catálogo bruto (sem de-para): churches, masses, priests. */
async function scrapeCatalogData({ log = console, ...crawlOptions } = {}) {
  const parishes = await crawlParishes({ log, ...crawlOptions });
  if (!parishes.length) return { churches: [], masses: [], priests: [] };
  const coords = await cityCoords([...new Set(parishes.map((p) => `${p.city}|${p.state}`))], { log });
  return buildCatalog(parishes, coords, await parseBishop(log), readJson('priests.json', []));
}

module.exports = { scrapeCatalogData, buildCatalog, crawlParishes, parseBishop, cityCoords, normalizeName, pageUrl, FIRST_ID, LAST_ID };
