const validateId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: `O parâmetro ${paramName} deve ser um número válido`,
        received: id
      });
    }
    next();
  };
};

const validateDay = (req, res, next) => {
  const { day } = req.params;
  const validDays = [
    'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
    'quinta-feira', 'sexta-feira', 'sábado'
  ];

  if (!day || !validDays.includes(day.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid Day',
      message: 'Dia da semana inválido',
      validDays: validDays,
      received: day
    });
  }
  next();
};

const validateCoords = (req, res, next) => {
  const { lat, lng } = req.query;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (lat === undefined || lng === undefined || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({
      error: 'Invalid Coordinates',
      message: 'Informe latitude (lat) e longitude (lng) válidas via query string',
      received: { lat, lng }
    });
  }

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