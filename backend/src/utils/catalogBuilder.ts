import axios from 'axios';
import { fetchHtml, sleep } from './http';
import { parseParish, SITE } from './parishParser';
import { htmlToText } from './htmlText';
import { readJson, writeJson } from './fileStore';
import { crawlForanias, crawlClergyDirectory } from './dioceseEnricher';
import type { Bishop, Church, CityCoords, ClergyDirectoryEntry, Logger, Mass, ParsedParish, Priest, ScrapedCatalog } from '../types';

export interface CrawlOptions {
  firstId?: number;
  lastId?: number;
  log?: Logger;
}

// Resposta do geocodificador Photon (só os campos usados).
interface PhotonResponse {
  features: Array<{ properties: { countrycode?: string }; geometry: { coordinates: [number, number] } }>;
}

// Durante a montagem todo padre já tem a lista de paróquias.
type BuiltPriest = Priest & { churchIds: number[] };

export const FIRST_ID = 2014;
export const LAST_ID = 2265;
const BISHOP_PAGE_ID = 1865;
const SEAT_ID = 2080; // Sé Catedral
const CONCURRENCY = 6;

export const pageUrl = (id: number): string => `${SITE}/?menu=noticia_detalhe&id=${id}&id_orgao=1`;

const ORDERS = 'OFMCap|OFMConv|OFM|OAR|SJS|CSsR|SDB|OSA|OSB|OCD|OMI|MCCJ|SCJ|SVD|MSC|IMC|FDP|SSS|CSS|CP|CM|OP|SJ|SJC';

// "Pe Fulano , sjs" -> "Pe. Fulano, SJS"
export const normalizeName = (name: string): string =>
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

export async function crawlParishes({ firstId = FIRST_ID, lastId = LAST_ID, log = console }: CrawlOptions = {}): Promise<ParsedParish[]> {
  const ids = Array.from({ length: lastId - firstId }, (_, i) => firstId + i);
  const parishes: ParsedParish[] = [];
  const unparsed: number[] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const pages = await Promise.all(ids.slice(i, i + CONCURRENCY).map(async (id) => [id, await fetchHtml(pageUrl(id), { log })] as const));
    pages.forEach(([id, html]) => {
      const parish = html && parseParish(html, id);
      if (parish) parishes.push(parish);
      else if (html && /Local e Contato/.test(html)) unparsed.push(id); // parecia paróquia mas o parser rejeitou
    });
  }
  if (unparsed.length) log.warn(`Páginas com "Local e Contato" não interpretadas: ${unparsed.join(', ')}`);
  return parishes.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function parseBishop(log: Logger = console): Promise<Bishop | null> {
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
export async function cityCoords(cities: readonly string[], { log = console }: { log?: Logger } = {}): Promise<CityCoords> {
  const cache = readJson<CityCoords>('cityCoords.json', {});
  let changed = false;
  for (const key of cities) {
    if (cache[key]) continue;
    const [city, state] = key.split('|');
    for (let attempt = 1; attempt <= 4 && !cache[key]; attempt += 1) {
      try {
        const { data } = await axios.get<PhotonResponse>('https://photon.komoot.io/api/', { params: { q: `${city}, ${state}, Brasil`, limit: 3 }, timeout: 8000 });
        const hit = data.features.find((f) => f.properties.countrycode === 'BR');
        if (hit) {
          cache[key] = [hit.geometry.coordinates[1], hit.geometry.coordinates[0]];
          changed = true;
        } else break;
      } catch (error) {
        if (attempt === 4) log.warn(`Sem coordenadas para ${key}: ${error instanceof Error ? error.message : String(error)}`);
      }
      await sleep(1500);
    }
  }
  if (changed) writeJson('cityCoords.json', cache);
  return cache;
}

// `previousPriests` (priests.json atual) preserva os ids: o app guarda favoritos por id de padre.
export function buildCatalog(
  parishes: readonly ParsedParish[],
  coords: CityCoords,
  bishop: Bishop | null,
  previousPriests: ReadonlyArray<Pick<Priest, 'id' | 'name'>> = [],
  foraniaMap: ReadonlyMap<number, string> = new Map(),
  clergyDirectory: ReadonlyMap<string, ClergyDirectoryEntry> = new Map()
): ScrapedCatalog {
  const churches = parishes.map(({ sourceId, clergy, masses, ...p }): Church => {
    const [latitude, longitude] = coords[`${p.city}|${p.state}`] || [null, null];
    const forania = foraniaMap.get(sourceId) || null;
    return {
      id: sourceId,
      ...p,
      forania,
      latitude,
      longitude,
      coordinatesVerified: false,
      coordinatesPrecision: 'city',
    };
  });

  const massList: Mass[] = [];
  parishes.forEach((p) => p.masses.forEach((m) => massList.push({
    id: massList.length + 1,
    churchId: p.sourceId,
    dayOfWeek: m.dayOfWeek,
    time: m.time,
    type: m.dayOfWeek === 'Domingo' ? 'Missa Dominical' : 'Missa Semanal',
  })));

  const knownIds = new Map(previousPriests.map((p) => [p.name, p.id]));
  let nextId = Math.max(0, ...previousPriests.map((p) => p.id)) + 1;
  const idFor = (name: string): number => knownIds.get(name) || nextId++;

  const priests: BuiltPriest[] = [];
  if (bishop) {
    priests.push({
      id: idFor(bishop.name),
      name: bishop.name,
      title: 'Bispo Diocesano',
      churchId: SEAT_ID,
      email: null,
      phone: bishop.phone,
      bio: bishop.bio,
      image: bishop.image || null,
      birthDate: '09/04/1957',
      ordinationDate: '15/12/2013',
      churchIds: [SEAT_ID],
    });
  }

  // Encontra informações enriquecidas de clero por proximidade e normalização resiliente de nome
  const cleanClergyName = (str: string | undefined): string =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^(?:pe\.?|padre|diacono|diácono|frei|monsenhor|fr\.|cônego|conego)\s+/i, '')
      .replace(/,.*$/, '')
      .replace(/\s+/g, ' ')
      .trim();

  const findDirectoryEntry = (name: string): ClergyDirectoryEntry | null => {
    const norm = cleanClergyName(name);
    // 1. Busca exata ou substring direta
    for (const [key, val] of clergyDirectory.entries()) {
      const keyNorm = cleanClergyName(val.name || key);
      if (norm === keyNorm || (norm.length > 5 && keyNorm.includes(norm)) || (keyNorm.length > 5 && norm.includes(keyNorm))) {
        return val;
      }
    }

    // 2. Busca por palavras com tolerância ortográfica (ex.: Sousa/Souza, Golçalves/Gonçalves)
    const normVariant = norm
      .replace(/\bsousa\b/g, 'souza')
      .replace(/\bgolcalves\b/g, 'goncalves');
    const pWords = normVariant.split(' ').filter((w) => w.length > 2);
    for (const [key, val] of clergyDirectory.entries()) {
      const keyNorm = cleanClergyName(val.name || key)
        .replace(/\bsousa\b/g, 'souza')
        .replace(/\bgolcalves\b/g, 'goncalves');
      const dWords = keyNorm.split(' ').filter((w) => w.length > 2);
      if (pWords.length >= 2 && pWords.every((w) => dWords.includes(w))) return val;
      if (dWords.length >= 2 && dWords.every((w) => pWords.includes(w))) return val;
    }

    return null;
  };

  // Um padre pode atender mais de uma paróquia: fica um único registro, com todas em `churchIds`.
  // (O bispo já nasce com `churchIds`: é o único registro neste ponto.)
  const byName = new Map(priests.map((p) => [p.name, p]));
  parishes.forEach((p) => p.clergy.forEach((c) => {
    const name = normalizeName(c.name);
    const known = byName.get(name);
    if (known) {
      if (!known.churchIds.includes(p.sourceId)) known.churchIds.push(p.sourceId);
      return;
    }
    const dirEntry = findDirectoryEntry(name);
    const priest: BuiltPriest = {
      id: idFor(name),
      name,
      title: c.title,
      churchId: p.sourceId,
      churchIds: [p.sourceId],
      email: p.email,
      phone: p.phone,
      bio: `${c.title} da ${p.name} (${p.city}/${p.state}).`,
      image: (dirEntry && dirEntry.image) || null,
      birthDate: (dirEntry && dirEntry.birthDate) || null,
      ordinationDate: (dirEntry && dirEntry.ordinationDate) || null,
    };
    byName.set(name, priest);
    priests.push(priest);
  }));

  priests.sort((a, b) => a.id - b.id);
  return { churches, masses: massList, priests };
}

/** Catálogo bruto (sem de-para): churches, masses, priests. */
export async function scrapeCatalogData({ log = console, ...crawlOptions }: CrawlOptions = {}): Promise<ScrapedCatalog> {
  const [parishes, bishop, foraniaMapResult, clergyDirResult] = await Promise.all([
    crawlParishes({ log, ...crawlOptions }),
    parseBishop(log).catch((err: Error) => { log.warn(`Erro ao raspar bispo: ${err.message}`); return null; }),
    crawlForanias({ log }).catch((err: Error) => { log.warn(`Erro ao raspar foranias: ${err.message}`); return new Map<number, string>(); }),
    crawlClergyDirectory({ log }).catch((err: Error) => { log.warn(`Erro ao raspar clero: ${err.message}`); return new Map<string, ClergyDirectoryEntry>(); }),
  ]);
  if (!parishes.length) return { churches: [], masses: [], priests: [] };
  const coords = await cityCoords([...new Set(parishes.map((p) => `${p.city}|${p.state}`))], { log });
  return buildCatalog(parishes, coords, bishop, readJson<Priest[]>('priests.json', []), foraniaMapResult || new Map(), clergyDirResult || new Map());
}
