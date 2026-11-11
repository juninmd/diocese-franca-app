import fs from 'fs';
import path from 'path';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import churchesRouter from './routes/churches';
import priestsRouter from './routes/priests';
import massesRouter from './routes/masses';
import newsRouter from './routes/news';
import { cacheControl, noStore } from './middleware/cache';
import { getCatalog } from './utils/catalog';
import { readCached, updatedAt } from './utils/fileStore';
import { evaluateHealth } from './utils/health';
import type { NewsItem } from './types';

// package.json fica um nível acima de src/ e de dist/ (fora do rootDir do TypeScript).
const { version: VERSION } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as { version: string };

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.TRUST_PROXY) {
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy === 'true') app.set('trust proxy', true);
  else if (trustProxy === 'false') app.set('trust proxy', false);
  else if (!isNaN(Number(trustProxy))) app.set('trust proxy', Number(trustProxy));
  else app.set('trust proxy', trustProxy);
}

app.use(helmet());
app.use(compression());
app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use((req, res, next) => {
  const start = Date.now();
  req.requestTime = new Date(start).toISOString();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const path = req.originalUrl ? req.originalUrl.split('?')[0] : req.path;
    console.log(`[${req.requestTime}] ${req.method} ${path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.get('/api/health', noStore, (req, res) => {
  const catalog = getCatalog();
  const catalogUpdatedAt = updatedAt('churches.json');
  const health = evaluateHealth({
    churchesCount: catalog.churches.length,
    catalogUpdatedAt,
    maxAgeDays: Number(process.env.DATA_MAX_AGE_DAYS) || undefined
  });
  res.status(health.status === 'unhealthy' ? 503 : 200).json({
    status: health.status,
    errors: health.errors,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: VERSION,
    data: {
      churches: catalog.churches.length,
      priests: catalog.priests.length,
      masses: catalog.masses.length,
      news: readCached<NewsItem[]>('news.json', []).length,
      catalogUpdatedAt,
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

app.get('/api/test-error', (req, res, next) => {
  next(new Error('Erro de teste interno detalhado'));
});

// Os dados só mudam quando o scraper roda: clientes e proxies podem reutilizar (ETag + max-age).
app.use('/api/churches', cacheControl({ maxAge: 300 }), churchesRouter);
app.use('/api/priests', cacheControl({ maxAge: 300 }), priestsRouter);
app.use('/api/masses', cacheControl({ maxAge: 300 }), massesRouter);
app.use('/api/news', cacheControl({ maxAge: 120 }), newsRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Diocese de Franca API',
    version: VERSION,
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

// O Express só reconhece o tratador de erros pela aridade 4: `next` precisa ficar na assinatura.
const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Ocorreu um erro interno no servidor',
    timestamp: new Date().toISOString()
  });
};
app.use(errorHandler);

// Só sobe o servidor quando executado diretamente (`node dist/index.js`); em testes basta importar o app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
}

export = app;
