const { fetchHtml } = require('./http');
const cheerio = require('cheerio');
const { toHttpsUrl, SITE } = require('./safeUrl');

const ORDERS = 'OFMCap|OFMConv|OFM|OAR|SJS|CSsR|SDB|OSA|OSB|OCD|OMI|MCCJ|SCJ|SVD|MSC|IMC|FDP|SSS|CSS|CP|CM|OP|SJ|SJC';

const normalizeName = (name) =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(?:Pe\b\.?\s*\.?\s*)+/i, 'Pe. ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*-\s*Reitor$/i, '')
    .replace(/,\s*([A-Za-z]{2,5})\s*$/, (_, order) => `, ${order.toUpperCase()}`)
    .replace(new RegExp(`([^\\s,])\\s+(${ORDERS})$`, 'i'), (_, last, order) => `${last}, ${order.toUpperCase()}`)
    .trim();

const FORANIAS = [
  { id: 5770, name: 'Beata Rita Amada de Jesus' },
  { id: 5781, name: 'Nossa Senhora Aparecida' },
  { id: 5771, name: 'Nossa Senhora da Conceição' },
  { id: 5779, name: 'Santa Gianna' },
  { id: 5780, name: 'São Joaquim' },
];

/**
 * Fallback canônico territorial da Diocese de Franca para paróquias
 * cujo id não aparece explicitamente na paginação dos menus de forania.
 */
const FORANIA_DEFAULTS = {
  2046: 'Santa Gianna',               // Cristais Paulista
  2052: 'Santa Gianna',               // Paróquia Sagrada Família (Franca)
  2054: 'Santa Gianna',               // Paróquia Santa Cruz (Ribeirão Corrente)
  2055: 'Santa Gianna',               // Paróquia Santa Edwiges (Franca)
  2056: 'Santa Gianna',               // Paróquia Santa Gianna (Franca)
  2079: 'Santa Gianna',               // Paróquia São Vicente de Paulo (Franca)
};

/**
 * Raspa a lista de foranias e suas paróquias vinculadas a partir do menu oficial da Diocese.
 * Retorna um Map(parishId -> nomeDaForania).
 */
async function crawlForanias({ log = console } = {}) {
  const parishForaniaMap = new Map();

  for (const f of FORANIAS) {
    const rootUrl = `${SITE}/?menu=noticia_detalhe&id=${f.id}&id_menu_c=201&id_orgao=1`;
    const firstHtml = await fetchHtml(rootUrl, { log });
    if (!firstHtml) continue;
    const $first = cheerio.load(firstHtml);

    const pages = $first('.pagination a, a[href*="cpg="]').map((_, el) => {
      const m = $first(el).attr('href').match(/cpg=(\d+)/);
      return m ? parseInt(m[1], 10) : 1;
    }).get();
    const maxPage = pages.length ? Math.max(...pages) : 1;

    for (let cpg = 1; cpg <= maxPage; cpg++) {
      const url = cpg === 1
        ? rootUrl
        : `${SITE}/?menu=noticia_detalhe&id=${f.id}&id_menu_c=201&id_orgao=1&cpg=${cpg}`;
      const html = cpg === 1 ? firstHtml : await fetchHtml(url, { log });
      if (!html) continue;
      const $ = cheerio.load(html);
      $('.read_post_list li, .item').each((_, el) => {
        const link = $(el).find('a[href*="id="]').attr('href');
        const idMatch = link ? link.match(/id=(\d+)/) : null;
        if (idMatch && Number(idMatch[1]) !== f.id) {
          parishForaniaMap.set(Number(idMatch[1]), f.name);
        }
      });
    }
  }

  // Preenche eventuais paróquias territoriais conhecidas que o CMS da diocese não indexou na listagem
  for (const [id, forania] of Object.entries(FORANIA_DEFAULTS)) {
    if (!parishForaniaMap.has(Number(id))) {
      parishForaniaMap.set(Number(id), forania);
    }
  }

  return parishForaniaMap;
}

/**
 * Raspa os detalhes do clero (páginas de padres id=2001 e diáconos id=2002)
 * extraindo imagem oficial, nascimento e ordenação.
 */
async function crawlClergyDirectory({ log = console } = {}) {
  const directory = new Map();

  // 1. Diáconos (id=2002)
  const diacHtml = await fetchHtml(`${SITE}/?menu=noticia_detalhe&id=2002`, { log });
  if (diacHtml) {
    const $d = cheerio.load(diacHtml);
    $d('.item').each((_, el) => {
      const rawTitle = $d(el).find('h2, h3, h4, a[href*="id="], .post_title, b, strong').text().trim();
      const link = $d(el).find('a[href*="id="]').attr('href');
      const img = $d(el).find('img').attr('src');
      if (rawTitle && link) {
        const name = normalizeName(rawTitle);
        directory.set(name.toLowerCase(), { name, link, img, type: 'Diácono' });
      }
    });
  }

  // 2. Padres (id=2001, paginação dinâmica)
  const firstPriestHtml = await fetchHtml(`${SITE}/?menu=noticia_detalhe&id=2001`, { log });
  let maxPages = 7;
  if (firstPriestHtml) {
    const $firstP = cheerio.load(firstPriestHtml);
    const pageText = $firstP('body').text();
    const pageMatch = pageText.match(/Página\s+\d+\s+de\s+(\d+)/i);
    if (pageMatch) maxPages = parseInt(pageMatch[1], 10);
  }

  for (let cpg = 1; cpg <= maxPages; cpg++) {
    const url = cpg === 1
      ? `${SITE}/?menu=noticia_detalhe&id=2001`
      : `${SITE}/?menu=noticia_detalhe&id=2001&cpg=${cpg}`;
    const html = cpg === 1 ? firstPriestHtml : await fetchHtml(url, { log });
    if (!html) continue;
    const $p = cheerio.load(html);
    $p('.read_post_list li').each((_, el) => {
      const rawTitle = $p(el).find('.post_title').text().trim();
      const link = $p(el).find('.post_title a').attr('href');
      const img = $p(el).find('img').attr('src');
      if (rawTitle && link) {
        const name = normalizeName(rawTitle);
        directory.set(name.toLowerCase(), { name, link, img, type: 'Padre' });
      }
    });
  }

  // 3. Buscar páginas de detalhe em lotes concorrentes para agilizar o tempo de resposta
  const entries = Array.from(directory.values());
  const CONCURRENCY = 8;
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (val) => {
        if (!val.link) return;
        const pageId = val.link.match(/id=(\d+)/)?.[1];
        if (!pageId) return;
        const detailHtml = await fetchHtml(`${SITE}/?menu=noticia_detalhe&id=${pageId}&id_orgao=1`, { log });
        if (detailHtml) {
          const $c = cheerio.load(detailHtml);
          const text = $c('.text_post_block').text().replace(/\s+/g, ' ');
          const birthDate = text.match(/Nascimento:\s*([0-9/]+)/i)?.[1] || null;
          const ordinationDate = text.match(/Ordena[çc][ãa]o:\s*([0-9/]+)/i)?.[1] || null;
          const detailImg = $c('img.scale_image2').attr('src') || val.img;
          val.birthDate = birthDate;
          val.ordinationDate = ordinationDate;
          val.image = detailImg ? toHttpsUrl(`${SITE}/${detailImg}`) : null;
        }
      })
    );
  }

  return directory;
}

module.exports = { crawlForanias, crawlClergyDirectory, FORANIAS, FORANIA_DEFAULTS };
