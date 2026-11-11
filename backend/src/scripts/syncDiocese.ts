/**
 * Sincroniza churches/priests/masses.json com as páginas oficiais das paróquias em
 * diocesefranca.org.br. Uso: `pnpm sync:diocese` ou `node dist/scripts/syncDiocese.js` (precisa de rede).
 * Complementos manuais ficam em data/depara.json (nunca são sobrescritos aqui).
 */
import { scrapeCatalog } from '../scraper';
import { normalizeName } from '../utils/catalogBuilder';

if (require.main === module) {
  scrapeCatalog().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}

export { normalizeName };
