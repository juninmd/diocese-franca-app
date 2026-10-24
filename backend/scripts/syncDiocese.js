/**
 * Sincroniza churches/priests/masses.json com as páginas oficiais das paróquias em
 * diocesefranca.org.br. Uso: `node scripts/syncDiocese.js` (precisa de rede).
 * Complementos manuais ficam em data/depara.json (nunca são sobrescritos aqui).
 */
const { scrapeCatalog } = require('../scraper');
const { normalizeName } = require('../utils/catalogBuilder');

if (require.main === module) {
  scrapeCatalog().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { normalizeName };
