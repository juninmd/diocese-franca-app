const DAY_INDEX = {
  'domingo': 0,
  'segunda-feira': 1,
  'terça-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  'sábado': 6,
};
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MINUTES_PER_WEEK = 7 * 24 * 60;
// Os horários são de Franca/SP; o servidor pode rodar em UTC, então o relógio é lido neste fuso.
const DIOCESE_TIMEZONE = 'America/Sao_Paulo';

// Dia da semana e minuto do dia de `date` no fuso informado.
const clockIn = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .formatToParts(date)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return { day: WEEKDAYS.indexOf(parts.weekday), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
};

/**
 * Encontra, dentre uma lista de missas de uma igreja, a próxima a acontecer
 * a partir de `now`. Considera o dia da semana e o horário (no fuso da diocese);
 * se a missa de hoje já passou, projeta a próxima ocorrência na semana seguinte.
 *
 * Retorna a missa original acrescida de `startsAt` (ISO) e `startsInMinutes`,
 * ou `null` se a lista estiver vazia ou nenhuma missa tiver dia/horário válido.
 */
const findNextMass = (masses, now = new Date(), timeZone = DIOCESE_TIMEZONE) => {
  if (!masses || masses.length === 0) return null;

  const current = clockIn(now, timeZone);
  const currentMinute = current.day * 24 * 60 + current.minutes;
  const nowMinuteMs = Math.floor(now.getTime() / 60000) * 60000;

  let best = null;
  let bestMinutes = Infinity;

  masses.forEach((mass) => {
    const dayIndex = DAY_INDEX[(mass.dayOfWeek || '').toLowerCase()];
    if (dayIndex === undefined) return;

    const [hours, minutes] = (mass.time || '').split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

    let minutesUntil = dayIndex * 24 * 60 + hours * 60 + minutes - currentMinute;
    // Já passou nesta semana: próxima ocorrência na semana seguinte.
    if (minutesUntil < 0) minutesUntil += MINUTES_PER_WEEK;

    if (minutesUntil < bestMinutes) {
      bestMinutes = minutesUntil;
      best = { ...mass, startsAt: new Date(nowMinuteMs + minutesUntil * 60000).toISOString(), startsInMinutes: minutesUntil };
    }
  });

  return best;
};

module.exports = { findNextMass, DIOCESE_TIMEZONE };
