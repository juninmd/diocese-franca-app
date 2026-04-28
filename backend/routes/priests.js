const express = require('express');
const router = express.Router();
const priests = require('../data/priests.json');
const churches = require('../data/churches.json');
const { validateId } = require('../middleware/validation');

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: priests.length,
    data: priests
  });
});

router.get('/:id', validateId('id'), (req, res) => {
  const priestId = parseInt(req.params.id);
  const priest = priests.find(p => p.id === priestId);

  if (!priest) {
    return res.status(404).json({
      error: 'Priest not found',
      message: `Padre com ID ${priestId} não encontrado`,
      priestId
    });
  }

  const church = churches.find(c => c.id === priest.churchId);

  res.json({
    success: true,
    data: {
      ...priest,
      church
    }
  });
});

module.exports = router;