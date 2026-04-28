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

module.exports = {
  validateId,
  validateDay
};