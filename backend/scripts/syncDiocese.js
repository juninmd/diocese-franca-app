/**
 * Sincroniza churches/priests/masses.json com as páginas oficiais das paróquias em
 * diocesefranca.org.br. Uso: `node scripts/syncDiocese.js` (precisa de rede).
 * Complementos manuais ficam em data/depara.json (nunca são sobrescritos aqui).
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { parseParish, SITE } = require('../utils/parishParser');
const { htmlToText } = require('../utils/htmlText');

const DATA = path.join(__dirname, '..', 'data');
const FIRST_ID = 2030;
const LAST_ID = 2400;
const BISHOP_PAGE_ID = 1865;
const SEAT_ID = 2080; // Sé Catedral
const CITY_FILE = path.join(DATA, 'cityCoords.json');

const pageUrl = (id) => `${SITE}/?menu=noticia_detalhe&id=${id}&id_orgao=1`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const write = (file, data) => fs.writeFileSync(path.join(DATA, file), `${JSON.stringify(data, null, 2)}\n`);

async function fetchPage(id) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await axios.get(pageUrl(id), { timeout: 25000, headers: { 'User-Agent': 'Mozilla/5.0 diocese-franca-app sync' } });
      return res.data;
    } catch (error) {
      await sleep(1000 * attempt);
    }
  }
  return '';
}

async function crawlParishes() {
  const ids = Array.from({ length: LAST_ID - FIRST_ID }, (_, i) => FIRST_ID + i);
  const parishes = [];
  for (let i = 0; i < ids.length; i += 6) {
    const pages = await Promise.all(ids.slice(i, i + 6).map(async (id) => [id, await fetchPage(id)]));
    pages.forEach(([id, html]) => {
      const parish = html && parseParish(html, id);
      if (parish) parishes.push(parish);
    });
  }
  return parishes;
}

// Coordenadas por cidade (Photon/OpenStreetMap), em cache no repositório. Precisão: cidade.
async function cityCoords(cities) {
  const cache = fs.existsSync(CITY_FILE) ? JSON.parse(fs.readFileSync(CITY_FILE, 'utf8')) : {};
  for (const key of cities) {
    if (cache[key]) continue;
    const [city, state] = key.split('|');
    try {
      const { data } = await axios.get('https://photon.komoot.io/api/', { params: { q: `${city}, ${state}, Brasil`, limit: 3 }, timeout: 8000 });
      const hit = data.features.find((f) => f.properties.countrycode === 'BR');
      if (hit) cache[key] = [hit.geometry.coordinates[1], hit.geometry.coordinates[0]];
    } catch (error) {
      console.warn(`Sem coordenadas para ${key}: ${error.message}`);
    }
    await sleep(1200);
  }
  fs.writeFileSync(CITY_FILE, `${JSON.stringify(cache, null, 2)}\n`);
  return cache;
}

async function parseBishop() {
  const text = htmlToText(await fetchPage(BISHOP_PAGE_ID));
  const name = (text.match(/Bispo atual\s*-\s*(Dom [^\n]+)/) || [])[1];
  if (!name) return null;
  const born = (text.match(/Nascido em ([^-\n]+)- (\d{2}\/\d{2}\/\d{4})/) || []).slice(1);
  const seat = (text.match(/Nomeado Bispo de Franca[^\n]*\n\s*Posse:\s*(\d{2}\/\d{2}\/\d{4})/) || [])[1];
  const phone = (text.match(/Fone:\s*(\(\d{2}\)\s?\d{4}-\d{4})/) || [])[1];
  const bio = [`${(text.match(/(\d)º Bispo Diocesano/) || [])[1] || ''}º Bispo Diocesano de Franca`.replace(/^º /, ''),
    born.length ? `nascido em ${born[0].trim()} (${born[1]})` : '', seat ? `com posse em ${seat}` : '']
    .filter(Boolean).join(', ') + '.';
  return { name: name.trim(), phone, bio };
}

const normalizeName = (name) => name.replace(/^Pe\.?\s+/i, 'Pe. ').replace(/\s+/g, ' ').trim();

async function main() {
  const parishes = (await crawlParishes()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const coords = await cityCoords([...new Set(parishes.map((p) => `${p.city}|${p.state}`))]);
  const churches = parishes.map(({ sourceId, clergy, masses, ...p }) => {
    const [latitude, longitude] = coords[`${p.city}|${p.state}`] || [null, null];
    return { id: sourceId, ...p, latitude, longitude, coordinatesVerified: false, coordinatesPrecision: 'city' };
  });
  const massList = [];
  parishes.forEach((p) => p.masses.forEach((m) => massList.push({
    id: massList.length + 1, churchId: p.sourceId, dayOfWeek: m.dayOfWeek, time: m.time,
    type: m.dayOfWeek === 'Domingo' ? 'Missa Dominical' : 'Missa Semanal',
  })));

  const priests = [];
  const bishop = await parseBishop();
  if (bishop) {
    priests.push({ id: 1, name: bishop.name, title: 'Bispo Diocesano', churchId: SEAT_ID, email: null, phone: bishop.phone || null, bio: bishop.bio, image: null });
  }
  const seen = new Set(priests.map((p) => p.name));
  parishes.forEach((p) => p.clergy.forEach((c) => {
    const name = normalizeName(c.name);
    if (seen.has(name)) return;
    seen.add(name);
    priests.push({
      id: priests.length + 1, name, title: c.title, churchId: p.sourceId, email: p.email, phone: p.phone,
      bio: `${c.title} da ${p.name} (${p.city}/${p.state}).`, image: null,
    });
  }));

  write('churches.json', churches);
  write('masses.json', massList);
  write('priests.json', priests);
  console.log(`Sincronizado: ${churches.length} paróquias, ${massList.length} missas, ${priests.length} padres/diáconos.`);
}

if (require.main === module) main().catch((error) => { console.error(error); process.exit(1); });

module.exports = { normalizeName };
