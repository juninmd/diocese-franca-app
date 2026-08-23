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
