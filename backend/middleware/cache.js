// Cabeçalhos de cache HTTP para a API (dados mudam no máximo quando o scraper roda).
// O Express já gera ETag fraco; com Cache-Control o app revalida com If-None-Match (304, sem corpo).
const cacheControl = ({ maxAge = 300, staleWhileRevalidate = 3600 } = {}) => (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
  }
  next();
};

const noStore = (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

module.exports = { cacheControl, noStore };
