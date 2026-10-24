const express = require('express');
const router = express.Router();
const { getCatalog } = require('../utils/catalog');
const { validateId, validateCoords } = require('../middleware/validation');
const { distanceInKm } = require('../utils/geo');
const { findNextMass } = require('../utils/nextMass');

router.get('/', (req, res) => {
  const { churches } = getCatalog();
  res.json({
    success: true,
    count: churches.length,
    data: churches
  });
});

// Rota registrada antes de "/:id" para não ser capturada por validateId('id').
router.get('/nearby', validateCoords, (req, res) => {
  const { latitude, longitude } = req.coords;
  const { churches, massesByChurch } = getCatalog();

  const churchesWithDistance = churches
    .filter((church) => typeof church.latitude === 'number' && typeof church.longitude === 'number')
    .map((church) => {
      return {
        ...church,
        distanceKm: Math.round(distanceInKm(latitude, longitude, church.latitude, church.longitude) * 10) / 10,
        nextMass: findNextMass(massesByChurch.get(church.id) || [])
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
  const { churchesById, massesByChurch, priests } = getCatalog();
  const church = churchesById.get(churchId);

  if (!church) {
    return res.status(404).json({
      error: 'Church not found',
      message: `Igreja com ID ${churchId} não encontrada`,
      churchId
    });
  }

  const churchMasses = massesByChurch.get(church.id) || [];
  // Equipe da paróquia (sem o bispo, que tem tela própria); o pároco vem primeiro.
  const clergy = priests.filter(p => (p.churchIds || [p.churchId]).includes(church.id) && p.title !== 'Bispo Diocesano');
  const churchPriest = clergy.find(p => p.title === 'Pároco') || clergy[0];

  res.json({
    success: true,
    data: {
      ...church,
      masses: churchMasses,
      priest: churchPriest,
      clergy,
      nextMass: findNextMass(churchMasses)
    }
  });
});

module.exports = router;