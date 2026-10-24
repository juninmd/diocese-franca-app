const { fetchHtml } = require('./utils/http');
const { parseNews, ORIGIN } = require('./utils/newsParser');
const { scrapeCatalogData } = require('./utils/catalogBuilder');
const { writeIfSane } = require('./utils/fileStore');

/** Notícias da home do site; só substitui news.json se vier ao menos uma matéria. */
const scrapeNews = async ({ log = console } = {}) => {
  const html = await fetchHtml(`${ORIGIN}/`, { log });
  const news = parseNews(html);
  if (!writeIfSane('news.json', news, { minRatio: 0, log })) {
    log.warn('Notícias não atualizadas (site indisponível ou layout alterado); mantendo news.json atual.');
    return [];
  }
  log.log(`Notícias: ${news.length} itens.`);
  return news;
};

/** Paróquias, padres e missas (data/churches|priests|masses.json). O de-para é aplicado só na leitura. */
const scrapeCatalog = async ({ log = console, ...options } = {}) => {
  const catalog = await scrapeCatalogData({ log, ...options });
  const { churches, priests, masses } = catalog;
  // Missas e padres dependem das paróquias: grava tudo ou nada.
  const ok = writeIfSane('churches.json', churches, { log })
    && writeIfSane('masses.json', masses, { log })
    && writeIfSane('priests.json', priests, { log });
  if (ok) log.log(`Catálogo: ${churches.length} paróquias, ${priests.length} padres/diáconos, ${masses.length} missas.`);
  else log.warn('Catálogo não atualizado; mantendo os arquivos atuais.');
  return catalog;
};

const scrapeAll = async (options = {}) => {
  const news = await scrapeNews(options);
  const catalog = await scrapeCatalog(options);
  return { news, ...catalog };
};

if (require.main === module) {
  scrapeAll().catch((error) => {
    console.error('Erro fatal no scraper:', error);
    process.exit(1);
  });
}

module.exports = { scrapeNews, scrapeCatalog, scrapeAll };
