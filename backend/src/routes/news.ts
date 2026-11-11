import express from 'express';
import { readCached, updatedAt } from '../utils/fileStore';
import type { NewsItem } from '../types';

const router = express.Router();

// Notícias vêm de data/news.json (scraper). Cache com cabeçalho mais curto: mudam com mais frequência.
router.get('/', (req, res) => {
  const data = readCached<NewsItem[]>('news.json', []);
  res.json({
    success: true,
    count: data.length,
    updatedAt: updatedAt('news.json'),
    data
  });
});

export default router;
