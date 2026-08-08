const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
  try {
    const newsPath = path.join(__dirname, '../data/news.json');
    if (!fs.existsSync(newsPath)) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
    res.json({
      success: true,
      count: newsData.length,
      data: newsData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read news data',
      message: error.message
    });
  }
});

module.exports = router;