const DAY_INDEX = {
  'domingo': 0,
  'segunda-feira': 1,
  'terça-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  'sábado': 6,
};

/**
 * Encontra, dentre uma lista de missas de uma igreja, a próxima a acontecer
 * a partir de `now`. Considera o dia da semana e o horário; se a missa de hoje
 * já passou, projeta a próxima ocorrência na semana seguinte.
 *
 * Retorna a missa original acrescida de `startsAt` (ISO) e `startsInMinutes`,
 * ou `null` se a lista estiver vazia ou nenhuma missa tiver dia/horário válido.
 */
const findNextMass = (masses, now = new Date()) => {
  if (!masses || masses.length === 0) return null;

  let best = null;
  let bestMinutes = Infinity;

  masses.forEach((mass) => {
    const dayIndex = DAY_INDEX[(mass.dayOfWeek || '').toLowerCase()];
    if (dayIndex === undefined) return;

    const [hours, minutes] = (mass.time || '').split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    let dayDiff = dayIndex - now.getDay();
    if (dayDiff < 0) dayDiff += 7;

    const massDate = new Date(now);
    massDate.setDate(now.getDate() + dayDiff);
    massDate.setHours(hours, minutes, 0, 0);

    // Missa de hoje que já começou/passou: considera a ocorrência da próxima semana.
    if (massDate.getTime() < now.getTime()) {
      massDate.setDate(massDate.getDate() + 7);
    }

    const minutesUntil = Math.round((massDate.getTime() - now.getTime()) / 60000);
    if (minutesUntil < bestMinutes) {
      bestMinutes = minutesUntil;
      best = { ...mass, startsAt: massDate.toISOString(), startsInMinutes: minutesUntil };
    }
  });

  return best;
};

module.exports = { findNextMass };
