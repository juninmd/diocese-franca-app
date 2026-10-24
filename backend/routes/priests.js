const express = require('express');
const router = express.Router();
const { getCatalog } = require('../utils/catalog');
const { validateId } = require('../middleware/validation');

// Na lista cada padre traz a paróquia resumida (para mostrar a cidade sem nova requisição).
router.get('/', (req, res) => {
  const { priests, churchesById } = getCatalog();
  const data = priests.map((priest) => {
    const church = churchesById.get(priest.churchId);
    return { ...priest, church: church ? { id: church.id, name: church.name, city: church.city, state: church.state } : null };
  });
  res.json({
    success: true,
    count: data.length,
    data
  });
});

router.get('/:id', validateId('id'), (req, res) => {
  const priestId = parseInt(req.params.id);
  const { priests, churchesById } = getCatalog();
  const priest = priests.find(p => p.id === priestId);

  if (!priest) {
    return res.status(404).json({
      error: 'Priest not found',
      message: `Padre com ID ${priestId} não encontrado`,
      priestId
    });
  }

  const church = churchesById.get(priest.churchId);

  res.json({
    success: true,
    data: {
      ...priest,
      church
    }
  });
});

module.exports = router;