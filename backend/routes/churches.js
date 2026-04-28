const express = require('express');
const router = express.Router();
const churches = require('../data/churches.json');
const masses = require('../data/masses.json');
const priests = require('../data/priests.json');
const { validateId } = require('../middleware/validation');

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: churches.length,
    data: churches
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
      priest: churchPriest
    }
  });
});

module.exports = router;