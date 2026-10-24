const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const churchesRouter = require('./routes/churches');
const priestsRouter = require('./routes/priests');
const massesRouter = require('./routes/masses');
const newsRouter = require('./routes/news');
const { cacheControl, noStore } = require('./middleware/cache');
const { getCatalog } = require('./utils/catalog');
const { readCached, updatedAt } = require('./utils/fileStore');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`[${req.requestTime}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', noStore, (req, res) => {
  const catalog = getCatalog();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    data: {
      churches: catalog.churches.length,
      priests: catalog.priests.length,
      masses: catalog.masses.length,
      news: readCached('news.json', []).length,
      catalogUpdatedAt: updatedAt('churches.json'),
      newsUpdatedAt: updatedAt('news.json')
    },
    endpoints: {
      churches: '/api/churches',
      priests: '/api/priests',
      masses: '/api/masses',
      news: '/api/news'
    }
  });
});

// Os dados só mudam quando o scraper roda: clientes e proxies podem reutilizar (ETag + max-age).
app.use('/api/churches', cacheControl({ maxAge: 300 }), churchesRouter);
app.use('/api/priests', cacheControl({ maxAge: 300 }), priestsRouter);
app.use('/api/masses', cacheControl({ maxAge: 300 }), massesRouter);
app.use('/api/news', cacheControl({ maxAge: 120 }), newsRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Diocese de Franca API',
    version: '1.0.0',
    description: 'API REST para o aplicativo da Diocese de Franca',
    documentation: {
      health: '/api/health',
      churches: '/api/churches',
      priests: '/api/priests',
      masses: '/api/masses',
      news: '/api/news'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Rota ${req.method} ${req.url} não encontrada`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/churches',
      'GET /api/churches/:id',
      'GET /api/priests',
      'GET /api/priests/:id',
      'GET /api/masses',
      'GET /api/masses/by-church/:id',
      'GET /api/masses/by-day/:day',
      'GET /api/churches/nearby?lat=&lng=',
      'GET /api/news'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Ocorreu um erro interno no servidor'
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// Só sobe o servidor quando executado diretamente (`node index.js`); em testes basta importar o app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;