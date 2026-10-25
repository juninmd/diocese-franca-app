const validateId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!/^\d+$/.test(id || '')) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: `O parâmetro ${paramName} deve ser um número válido`,
        received: id
      });
    }
    next();
  };
};

const CANONICAL_DAYS = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado'
];

const DAY_MAP = {
  'domingo': 'domingo',
  'segunda-feira': 'segunda-feira',
  'segunda': 'segunda-feira',
  'terca-feira': 'terça-feira',
  'terca': 'terça-feira',
  'quarta-feira': 'quarta-feira',
  'quarta': 'quarta-feira',
  'quinta-feira': 'quinta-feira',
  'quinta': 'quinta-feira',
  'sexta-feira': 'sexta-feira',
  'sexta': 'sexta-feira',
  'sabado': 'sábado'
};

const normalizeStr = (str) =>
  typeof str === 'string'
    ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    : '';

const validateDay = (req, res, next) => {
  const { day } = req.params;
  const normalized = normalizeStr(day);
  const canonicalDay = DAY_MAP[normalized];

  if (!day || !canonicalDay) {
    return res.status(400).json({
      error: 'Invalid Day',
      message: 'Dia da semana inválido',
      validDays: CANONICAL_DAYS,
      received: day
    });
  }

  req.canonicalDay = canonicalDay;
  next();
};

const validateCoords = (req, res, next) => {
  const { lat, lng } = req.query;

  if (
    typeof lat !== 'string' ||
    typeof lng !== 'string' ||
    !/^-?\d+(\.\d+)?$/.test(lat) ||
    !/^-?\d+(\.\d+)?$/.test(lng)
  ) {
    return res.status(400).json({
      error: 'Invalid Coordinates',
      message: 'Informe latitude (lat) e longitude (lng) válidas via query string',
      received: { lat, lng }
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      error: 'Invalid Coordinates',
      message: 'Latitude deve estar entre -90 e 90 e longitude entre -180 e 180',
      received: { lat, lng }
    });
  }

  req.coords = { latitude, longitude };
  next();
};

module.exports = {
  validateId,
  validateDay,
  validateCoords
};