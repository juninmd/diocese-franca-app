/**
 * Formata o resultado de `findNextMass` (backend) em um texto amigável,
 * ex.: "Domingo às 09:00 (em 2 dias)".
 */
export const formatNextMass = (nextMass) => {
  if (!nextMass) return null;

  const minutes = nextMass.startsInMinutes;
  let when;
  if (minutes < 60) {
    when = `em ${Math.max(minutes, 0)} min`;
  } else if (minutes < 24 * 60) {
    when = `em ${Math.round(minutes / 60)}h`;
  } else {
    const days = Math.round(minutes / (24 * 60));
    when = `em ${days} dia${days > 1 ? 's' : ''}`;
  }

  return `${nextMass.dayOfWeek} às ${nextMass.time} (${when})`;
};

/**
 * Formata uma distância em km em um texto curto (ex.: "800 m" ou "3.2 km").
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === undefined || distanceKm === null) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};

const DAY_INDEX = {
  Domingo: 0, 'Segunda-feira': 1, 'Terça-feira': 2, 'Quarta-feira': 3, 'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6,
};
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_MINUTES = 7 * 24 * 60;

// Relógio de Franca/SP (os horários das missas são de lá); cai para o relógio do aparelho se o Intl falhar.
function dioceseClock(now) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(now)
      .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
    const day = WEEKDAYS.indexOf(parts.weekday);
    if (day >= 0) return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  } catch (error) {
    // usa o relógio local abaixo
  }
  return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
}

/**
 * Próxima missa de uma lista de missas da igreja, calculada no aparelho (mesma regra do backend).
 * Assim o dado em cache nunca mostra um "em 3h" desatualizado.
 */
export function computeNextMass(masses, now = new Date()) {
  if (!masses || masses.length === 0) return null;
  const clock = dioceseClock(now);
  const current = clock.day * 24 * 60 + clock.minutes;
  let best = null;
  masses.forEach((mass) => {
    const day = DAY_INDEX[mass.dayOfWeek];
    const [hours, minutes] = (mass.time || '').split(':').map(Number);
    if (day === undefined || Number.isNaN(hours) || Number.isNaN(minutes)) return;
    let until = day * 24 * 60 + hours * 60 + minutes - current;
    if (until < 0) until += WEEK_MINUTES;
    if (!best || until < best.startsInMinutes) best = { ...mass, startsInMinutes: until };
  });
  return best;
}
