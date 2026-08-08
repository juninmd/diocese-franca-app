const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const churchesRouter = require('./routes/churches');
const priestsRouter = require('./routes/priests');
const massesRouter = require('./routes/masses');
const newsRouter = require('./routes/news');

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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    endpoints: {
      churches: '/api/churches',
      priests: '/api/priests',
      masses: '/api/masses',
      news: '/api/news'
    }
  });
});

app.use('/api/churches', churchesRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/masses', massesRouter);
app.use('/api/news', newsRouter);

app.get('/', (req, res) => {
  res.json({
    message: ' Diocese de Franca API',
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
      'GET /api/masses/by-day/:day'
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;