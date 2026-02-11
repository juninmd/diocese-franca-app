const express = require('express');
const router = express.Router();
const masses = require('../data/masses.json');
const churches = require('../data/churches.json');

// Get all masses
router.get('/', (req, res) => {
  // Include church information in each mass
  const massesWithChurch = masses.map(mass => {
    const church = churches.find(c => c.id === mass.churchId);
    return {
      ...mass,
      church: church ? { id: church.id, name: church.name } : null
    };
  });
  res.json(massesWithChurch);
});

// Get masses by church ID
router.get('/by-church/:churchId', (req, res) => {
  const churchId = parseInt(req.params.churchId);
  const churchMasses = masses.filter(m => m.churchId === churchId);
  
  if (churchMasses.length === 0) {
    return res.status(404).json({ error: 'No masses found for this church' });
  }
  
  const church = churches.find(c => c.id === churchId);
  res.json({
    church: church ? { id: church.id, name: church.name } : null,
    masses: churchMasses
  });
});

// Get masses by day of week
router.get('/by-day/:day', (req, res) => {
  const day = req.params.day;
  const dayMasses = masses.filter(m => 
    m.dayOfWeek.toLowerCase() === day.toLowerCase()
  );
  
  if (dayMasses.length === 0) {
    return res.status(404).json({ error: 'No masses found for this day' });
  }
  
  // Include church information
  const massesWithChurch = dayMasses.map(mass => {
    const church = churches.find(c => c.id === mass.churchId);
    return {
      ...mass,
      church: church ? { id: church.id, name: church.name, address: church.address } : null
    };
  });
  
  res.json(massesWithChurch);
});

module.exports = router;
