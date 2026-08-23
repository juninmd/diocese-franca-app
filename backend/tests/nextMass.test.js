const { findNextMass } = require('../utils/nextMass');

const masses = [
  { id: 1, churchId: 1, dayOfWeek: 'Domingo', time: '09:00', type: 'Missa Dominical' },
  { id: 2, churchId: 1, dayOfWeek: 'Quarta-feira', time: '19:00', type: 'Missa Semanal' },
  { id: 3, churchId: 1, dayOfWeek: 'Sexta-feira', time: '19:00', type: 'Missa Semanal' },
];

describe('findNextMass', () => {
  it('returns null for an empty list', () => {
    expect(findNextMass([])).toBeNull();
    expect(findNextMass(undefined)).toBeNull();
  });

  it('picks a mass later today when one is still upcoming', () => {
    // Quarta-feira (Wednesday), 2024-01-03, 10:00 -> a missa das 19:00 ainda não aconteceu
    const now = new Date(2024, 0, 3, 10, 0);
    const next = findNextMass(masses, now);
    expect(next.dayOfWeek).toBe('Quarta-feira');
    expect(next.time).toBe('19:00');
    expect(next.startsInMinutes).toBe(9 * 60);
  });

  it('skips to the next day when today\'s mass already happened', () => {
    // Quarta-feira, 2024-01-03, 20:00 -> a missa das 19:00 já passou, próxima é sexta
    const now = new Date(2024, 0, 3, 20, 0);
    const next = findNextMass(masses, now);
    expect(next.dayOfWeek).toBe('Sexta-feira');
    expect(next.startsAt).toContain('2024-01-05');
  });

  it('wraps around to next week when every mass this week has passed', () => {
    // Sexta-feira, 2024-01-05, 23:00 -> tudo já passou nesta semana, volta para o domingo
    const now = new Date(2024, 0, 5, 23, 0);
    const next = findNextMass(masses, now);
    expect(next.dayOfWeek).toBe('Domingo');
    expect(next.startsAt).toContain('2024-01-07');
  });

  it('ignores masses with an invalid day or time', () => {
    const invalid = [
      { id: 9, churchId: 1, dayOfWeek: 'Diaqualquer', time: '19:00' },
      { id: 10, churchId: 1, dayOfWeek: 'Domingo', time: 'não-informado' },
    ];
    expect(findNextMass(invalid)).toBeNull();
  });
});
