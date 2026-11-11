import express from 'express';
import { getCatalog } from '../utils/catalog';
import { validateId, validateDay } from '../middleware/validation';
import type { Church, Mass } from '../types';

const router = express.Router();

const withChurch = (mass: Mass, churchesById: Map<number, Church>) => {
  const church = churchesById.get(mass.churchId);
  return { ...mass, church: church ? { id: church.id, name: church.name, address: church.address } : null };
};

// Matriz + capelas por padrão; `?chapels=false` devolve só as missas da matriz.
const listFor = (req: express.Request): Mass[] => {
  const { masses, allMasses } = getCatalog();
  return String(req.query.chapels).toLowerCase() === 'false' ? masses : allMasses;
};

router.get('/', (req, res) => {
  const { churchesById } = getCatalog();
  const data = listFor(req).map((mass) => withChurch(mass, churchesById));
  res.json({ success: true, count: data.length, data });
});

router.get('/by-church/:churchId', validateId('churchId'), (req, res) => {
  const churchId = parseInt(String(req.params.churchId));
  const { churchesById, massesByChurch } = getCatalog();
  const church = churchesById.get(churchId);

  if (!church) {
    res.status(404).json({
      error: 'Church not found',
      message: `Igreja com ID ${churchId} não encontrada`,
      churchId
    });
    return;
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
  const canonicalDay = req.canonicalDay || String(req.params.day).toLowerCase();
  const { churchesById } = getCatalog();
  const data = listFor(req)
    .filter((m) => (m.dayOfWeek || '').toLowerCase() === canonicalDay.toLowerCase())
    .map((mass) => withChurch(mass, churchesById));

  res.json({ success: true, day: canonicalDay, count: data.length, data });
});

export default router;
