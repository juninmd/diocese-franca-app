const express = require('express');
const router = express.Router();
const masses = require('../data/masses.json');
const churches = require('../data/churches.json');
const { validateId, validateDay } = require('../middleware/validation');

router.get('/', (req, res) => {
  const massesWithChurch = masses.map(mass => {
    const church = churches.find(c => c.id === mass.churchId);
    return {
      ...mass,
      church: church ? { id: church.id, name: church.name, address: church.address } : null
    };
  });

  res.json({
    success: true,
    count: massesWithChurch.length,
    data: massesWithChurch
  });
});

router.get('/by-church/:churchId', validateId('churchId'), (req, res) => {
  const churchId = parseInt(req.params.churchId);
  const churchMasses = masses.filter(m => m.churchId === churchId);
  const church = churches.find(c => c.id === churchId);

  if (!church) {
    return res.status(404).json({
      error: 'Church not found',
      message: `Igreja com ID ${churchId} não encontrada`,
      churchId
    });
  }

  res.json({
    success: true,
    church: { id: church.id, name: church.name },
    count: churchMasses.length,
    data: churchMasses
  });
});

router.get('/by-day/:day', validateDay, (req, res) => {
  const day = req.params.day.toLowerCase();
  const dayMasses = masses.filter(m => m.dayOfWeek.toLowerCase() === day);

  const massesWithChurch = dayMasses.map(mass => {
    const church = churches.find(c => c.id === mass.churchId);
    return {
      ...mass,
      church: church ? { id: church.id, name: church.name, address: church.address } : null
    };
  });

  res.json({
    success: true,
    day: day,
    count: massesWithChurch.length,
    data: massesWithChurch
  });
});

module.exports = router;