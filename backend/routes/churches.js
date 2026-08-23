const express = require('express');
const router = express.Router();
const churches = require('../data/churches.json');
const masses = require('../data/masses.json');
const priests = require('../data/priests.json');
const { validateId, validateCoords } = require('../middleware/validation');
const { distanceInKm } = require('../utils/geo');
const { findNextMass } = require('../utils/nextMass');

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: churches.length,
    data: churches
  });
});

// Rota registrada antes de "/:id" para não ser capturada por validateId('id').
router.get('/nearby', validateCoords, (req, res) => {
  const { latitude, longitude } = req.coords;

  const churchesWithDistance = churches
    .filter((church) => typeof church.latitude === 'number' && typeof church.longitude === 'number')
    .map((church) => {
      const churchMasses = masses.filter((m) => m.churchId === church.id);
      return {
        ...church,
        distanceKm: Math.round(distanceInKm(latitude, longitude, church.latitude, church.longitude) * 10) / 10,
        nextMass: findNextMass(churchMasses)
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    success: true,
    origin: { latitude, longitude },
    count: churchesWithDistance.length,
    data: churchesWithDistance,
    nearest: churchesWithDistance[0] || null
  });
});

router.get('/:id', validateId('id'), (req, res) => {
  const churchId = parseInt(req.params.id);
  const church = churches.find(c => c.id === churchId);

  if (!church) {
    return res.status(404).json({
      error: 'Church not found',
      message: `Igreja com ID ${churchId} não encontrada`,
      churchId
    });
  }

  const churchMasses = masses.filter(m => m.churchId === church.id);
  const churchPriest = priests.find(p => p.churchId === church.id);

  res.json({
    success: true,
    data: {
      ...church,
      masses: churchMasses,
      priest: churchPriest,
      nextMass: findNextMass(churchMasses)
    }
  });
});

module.exports = router;