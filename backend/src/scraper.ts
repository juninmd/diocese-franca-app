import { fetchHtml } from './utils/http';
import { parseNews, ORIGIN } from './utils/newsParser';
import { scrapeCatalogData, type CrawlOptions } from './utils/catalogBuilder';
import { writeIfSane } from './utils/fileStore';
import type { Logger, NewsItem, ScrapedCatalog } from './types';

/** Notícias da home do site; só substitui news.json se vier ao menos uma matéria. */
export const scrapeNews = async ({ log = console }: { log?: Logger } = {}): Promise<NewsItem[]> => {
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
export const scrapeCatalog = async ({ log = console, ...options }: CrawlOptions = {}): Promise<ScrapedCatalog> => {
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

export const scrapeAll = async (options: CrawlOptions = {}): Promise<ScrapedCatalog & { news: NewsItem[] }> => {
  const news = await scrapeNews(options);
  const catalog = await scrapeCatalog(options);
  return { news, ...catalog };
};

if (require.main === module) {
  scrapeAll().catch((error: unknown) => {
    console.error('Erro fatal no scraper:', error);
    process.exit(1);
  });
}
