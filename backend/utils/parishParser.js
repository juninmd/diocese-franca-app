const { htmlToText } = require('./htmlText');
const { parseMassLines } = require('./massParser');

const SITE = 'https://www.diocesefranca.org.br';
const PHONE = /\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const STOP_MASSES = /^(capela|comunidade|descri[çc][ãa]o|lar |compartilhar|santu[aá]rio|igreja)/i;

// Valor(es) de "Rótulo : valor" (a linha pode repetir, ex.: dois "Vigário paroquial").
const field = (text, label) =>
  [...text.matchAll(new RegExp(`^[ \\t]*${label}[ \\t]*:[ \\t]*(.*)$`, 'gmi'))].map((m) => m[1].trim()).filter(Boolean).join(', ');

// O endereço pode quebrar linha ("Rua\nPayaguas, 826") até o próximo rótulo.
const addressField = (text) =>
  ((text.match(/Endereço\s*:([\s\S]*?)\n\s*Cidade\/UF/i) || [])[1] || '').replace(/\s+/g, ' ').trim();

const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  return `(${digits.slice(0, 2)}) ${digits.slice(2, -4)}-${digits.slice(-4)}`;
};

const lines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);

// "Pe. A, Pe. B" / "Diácono X, Diácono Y" -> lista (a vírgula de "..., SJS" é preservada)
const splitPeople = (value) =>
  value.split(/;\s*|,\s*(?=Pe\.?\s|Padre|Frei|Fr\.|Di[aá]cono|Mons|C[ôo]nego)/i).map((n) => n.trim()).filter(Boolean);

const ZIP = /(\d{2})\s?\.?\s?(\d{3})\s?-?\s?(\d{3})/;
const formatZip = (text) => {
  const m = text.match(ZIP);
  return m ? `${m[1]}${m[2]}-${m[3]}` : null;
};

const cleanAddress = (raw) =>
  raw
    .replace(/[.,\s-]*(Caixa Postal|Cx\.? Postal|C\. ?P\.)\s*\d+[.,]?/i, '')
    .replace(new RegExp(`[.,\\s-]*(CEP[:\\s-]*)?${ZIP.source}`, 'i'), '')
    .replace(/^(\w+)\s*\.\s+/, '$1 ')
    .replace(/[\s,.-]+$/, '')
    .replace(/,\s*(?=[^,]*$)/, ' - ');

const toIsoDate = (br) => {
  const m = br.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

const shorten = (text, max = 280) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf('. ') + 1, cut.lastIndexOf(' ')))}…`.replace(/\.…$/, '.');
};

// "Paróquia X (Cidade-SP)" -> { name, city, state }; páginas sem prefixo recebem "Paróquia".
function parseTitle(title) {
  const m = title.match(/^(.*?)\s*\(([^)]*?)\s*-\s*([A-Z]{2})\)\s*$/);
  const [rawName, city, state] = m ? [m[1], m[2], m[3]] : [title, '', 'SP'];
  const name = /^(par[óo]quia|s[ée] catedral|santu[áa]rio|menino|capela)/i.test(rawName) ? rawName : `Paróquia ${rawName}`;
  return { name: name.trim(), city: city.trim(), state };
}

function parseParish(html, sourceId) {
  const title = (html.match(/<h2[^>]*>([^<]*)<\/h2>\s*<div class="text_post_block"/) || [])[1];
  const start = html.indexOf('Local e Contato');
  if (!title || start === -1) return null;
  const text = htmlToText(html.slice(start));
  const cut = text.indexOf('Compartilhar');
  const body = cut > 0 ? text.slice(0, cut) : text;

  const { name, city: titleCity, state: titleState } = parseTitle(htmlToText(title).trim());
  const [cityName, uf] = field(body, 'Cidade/UF').split(/\s*[-/]\s*(?=[A-Z]{2}$)/);
  const contact = body.slice(body.indexOf('Cidade/UF'), body.search(/^\s*Dados\s*$/m) > 0 ? body.search(/^\s*Dados\s*$/m) : undefined);
  const office = body.match(/Expediente da secretaria\s*:?([\s\S]*?)(?=\bMissas?[^:\n]{0,20}:)/i);
  const massBlock = body.match(/\bMissas?[^:\n]{0,20}:([\s\S]*)/i);
  const massLines = [];
  for (const line of lines(massBlock ? massBlock[1] : '')) {
    if (STOP_MASSES.test(line)) break;
    massLines.push(line);
  }
  const descLine = lines((body.match(/Descri[çc][ãa]o\s*\n([\s\S]*)/) || [])[1] || '')[0] || '';
  const description = descLine.length > 60 && !/^(expediente|missa|segunda|capela)/i.test(descLine) ? shorten(descLine) : null;
  const image = html.match(/<img src="(images\/[^"]+)"[^>]*class="scale_image2"/);

  return {
    sourceId,
    name,
    city: (cityName || titleCity).replace(/\s*\/\s*[A-Z]{2}$/, '').trim(),
    state: (uf || titleState).trim(),
    address: cleanAddress(addressField(body)),
    zipCode: formatZip(addressField(body)),
    phone: (contact.match(PHONE) || [])[0] ? formatPhone(contact.match(PHONE)[0]) : null,
    email: (contact.match(EMAIL) || [])[0] || null,
    foundedAt: toIsoDate(field(body, 'Data Criação')),
    officeHours: office ? lines(office[1]) : [],
    description,
    image: image ? encodeURI(`${SITE}/${image[1]}`) : null,
    website: `${SITE}/?menu=noticia_detalhe&id=${sourceId}&id_orgao=1`,
    clergy: [
      ...splitPeople(field(body, 'Pároco')).map((n) => ({ name: n, title: 'Pároco' })),
      ...splitPeople(field(body, 'Vigário paroquial')).map((n) => ({ name: n, title: 'Vigário Paroquial' })),
      ...splitPeople(field(body, 'Vigário')).map((n) => ({ name: n, title: 'Vigário' })),
      ...splitPeople(field(body, 'Cooperador')).map((n) => ({ name: n, title: /di[aá]cono/i.test(n) ? 'Diácono' : 'Cooperador' })),
    ],
    ...(() => {
      const { masses, notes } = parseMassLines(massLines);
      return { masses, massNotes: notes };
    })(),
  };
}

module.exports = { parseParish, parseTitle, splitPeople, SITE };
