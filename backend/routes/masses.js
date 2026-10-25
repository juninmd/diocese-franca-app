const express = require('express');
const router = express.Router();
const { getCatalog } = require('../utils/catalog');
const { validateId, validateDay } = require('../middleware/validation');

const withChurch = (mass, churchesById) => {
  const church = churchesById.get(mass.churchId);
  return { ...mass, church: church ? { id: church.id, name: church.name, address: church.address } : null };
};

router.get('/', (req, res) => {
  const { masses, churchesById } = getCatalog();
  const data = masses.map((mass) => withChurch(mass, churchesById));
  res.json({ success: true, count: data.length, data });
});

router.get('/by-church/:churchId', validateId('churchId'), (req, res) => {
  const churchId = parseInt(req.params.churchId);
  const { churchesById, massesByChurch } = getCatalog();
  const church = churchesById.get(churchId);

  if (!church) {
    return res.status(404).json({
      error: 'Church not found',
      message: `Igreja com ID ${churchId} não encontrada`,
      churchId
    });
  }

  const churchMasses = massesByChurch.get(churchId) || [];
  res.json({
    success: true,
    church: { id: church.id, name: church.name },
    count: churchMasses.length,
    data: churchMasses
  });
});

router.get('/by-day/:day', validateDay, (req, res) => {
  const canonicalDay = req.canonicalDay || req.params.day.toLowerCase();
  const { masses, churchesById } = getCatalog();
  const data = masses
    .filter((m) => (m.dayOfWeek || '').toLowerCase() === canonicalDay.toLowerCase())
    .map((mass) => withChurch(mass, churchesById));

  res.json({ success: true, day: canonicalDay, count: data.length, data });
});

module.exports = router;
