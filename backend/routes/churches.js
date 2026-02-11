const express = require('express');
const router = express.Router();
const churches = require('../data/churches.json');
const masses = require('../data/masses.json');
const priests = require('../data/priests.json');

// Get all churches
router.get('/', (req, res) => {
  res.json(churches);
});

// Get church by ID
router.get('/:id', (req, res) => {
  const church = churches.find(c => c.id === parseInt(req.params.id));
  if (!church) {
    return res.status(404).json({ error: 'Church not found' });
  }
  
  // Include masses and priest for this church
  const churchMasses = masses.filter(m => m.churchId === church.id);
  const churchPriest = priests.find(p => p.churchId === church.id);
  
  res.json({
    ...church,
    masses: churchMasses,
    priest: churchPriest
  });
});

module.exports = router;
