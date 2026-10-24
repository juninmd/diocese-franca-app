const express = require('express');
const router = express.Router();
const { readCached, updatedAt } = require('../utils/fileStore');

// Notícias vêm de data/news.json (scraper). Cache com cabeçalho mais curto: mudam com mais frequência.
router.get('/', (req, res) => {
  const data = readCached('news.json', []);
  res.json({
    success: true,
    count: data.length,
    updatedAt: updatedAt('news.json'),
    data
  });
});

module.exports = router;
