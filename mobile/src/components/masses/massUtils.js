// Utilitários de dados dos horários de missa (sem dependência de UI).
export const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Domingo..sábado da semana corrente, com dia do mês e flag de "hoje".
export function weekDays(now = new Date()) {
  return DAY_NAMES.map((name, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - now.getDay() + i);
    return { key: name, short: DAY_SHORT[i], num: d.getDate(), isToday: i === now.getDay() };
  });
}

// Título da seção: "Hoje, quarta-feira" quando é o dia atual.
export function dayTitle(dayName, now = new Date()) {
  return dayName === DAY_NAMES[now.getDay()] ? `Hoje, ${dayName.toLowerCase()}` : dayName;
}

// Agrupa por dia da semana (ordem de domingo a sábado) e ordena por horário.
export function groupByDay(list) {
  return DAY_NAMES.map((day) => ({
    day,
    data: list.filter((m) => m.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time)),
  })).filter((s) => s.data.length > 0);
}

// Id da próxima missa de hoje (primeiro horário ainda não passado).
export function findNextMassId(masses, now = new Date()) {
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const upcoming = masses
    .filter((m) => m.dayOfWeek === DAY_NAMES[now.getDay()] && m.time >= hhmm)
    .sort((a, b) => a.time.localeCompare(b.time));
  return upcoming.length ? upcoming[0].id : null;
}
