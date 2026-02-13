const express = require('express');
const router = express.Router();
const priests = require('../data/priests.json');
const churches = require('../data/churches.json');

// Get all priests
router.get('/', (req, res) => {
  res.json(priests);
});

// Get priest by ID
router.get('/:id', (req, res) => {
  const priest = priests.find(p => p.id === parseInt(req.params.id));
  if (!priest) {
    return res.status(404).json({ error: 'Priest not found' });
  }
  
  // Include church information
  const church = churches.find(c => c.id === priest.churchId);
  
  res.json({
    ...priest,
    church
  });
});

module.exports = router;
