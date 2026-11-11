import type { RequestHandler } from 'express';

export const validateId = (paramName: string): RequestHandler => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!/^\d+$/.test(String(id || ''))) {
      res.status(400).json({
        error: 'Invalid ID',
        message: `O parâmetro ${paramName} deve ser um número válido`,
        received: id
      });
      return;
    }
    next();
  };
};

const CANONICAL_DAYS = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado'
];

const DAY_MAP: Record<string, string> = {
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

const normalizeStr = (str: unknown): string =>
  typeof str === 'string'
    ? str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    : '';

export const validateDay: RequestHandler = (req, res, next) => {
  const { day } = req.params;
  const normalized = normalizeStr(day);
  const canonicalDay = DAY_MAP[normalized];

  if (!day || !canonicalDay) {
    res.status(400).json({
      error: 'Invalid Day',
      message: 'Dia da semana inválido',
      validDays: CANONICAL_DAYS,
      received: day
    });
    return;
  }

  req.canonicalDay = canonicalDay;
  next();
};

export const validateCoords: RequestHandler = (req, res, next) => {
  const { lat, lng } = req.query;

  if (
    typeof lat !== 'string' ||
    typeof lng !== 'string' ||
    !/^-?\d+(\.\d+)?$/.test(lat) ||
    !/^-?\d+(\.\d+)?$/.test(lng)
  ) {
    res.status(400).json({
      error: 'Invalid Coordinates',
      message: 'Informe latitude (lat) e longitude (lng) válidas via query string',
      received: { lat, lng }
    });
    return;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    res.status(400).json({
      error: 'Invalid Coordinates',
      message: 'Latitude deve estar entre -90 e 90 e longitude entre -180 e 180',
      received: { lat, lng }
    });
    return;
  }

  req.coords = { latitude, longitude };
  next();
};
