import { computeNextMass } from './massTime';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DAY_MINUTES = 24 * 60;

export interface ReminderSlot {
  dayOfWeek: string;
  time: string; // "HH:MM" no relógio de Franca/SP
}

export interface ReminderWhen {
  seconds: number;
  /** "hoje às 11:30", "amanhã às 07:00", "domingo às 08:30" ou "em instantes" */
  label: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

// Mesmo horário em todos os dias da semana (ex.: Ângelus às 12:00 e 18:00).
export const everyDay = (...times: string[]): ReminderSlot[] =>
  DAYS.flatMap((dayOfWeek) => times.map((time) => ({ dayOfWeek, time })));

/**
 * Quando avisar: `minutesBefore` antes da próxima ocorrência de um dos `slots`
 * (mesma regra de "próxima missa"). Se o aviso já passou, avisa em instantes.
 */
export function nextReminder(slots: ReminderSlot[], minutesBefore = 0, now: Date = new Date()): ReminderWhen | null {
  const next = computeNextMass(slots.map((s, id) => ({ ...s, id, churchId: 0, type: '' })), now);
  if (!next) return null;
  const lead = Math.max(0, next.startsInMinutes - minutesBefore);
  const [h, m] = next.time.split(':').map(Number);
  const nowOfDay = (((h * 60 + m - next.startsInMinutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const fireOfDay = nowOfDay + lead;
  const dayOffset = Math.floor(fireOfDay / DAY_MINUTES);
  const time = `${pad(Math.floor((fireOfDay % DAY_MINUTES) / 60))}:${pad(fireOfDay % 60)}`;
  let label = `${next.dayOfWeek.toLowerCase()} às ${time}`;
  if (lead === 0) label = 'em instantes';
  else if (dayOffset === 0) label = `hoje às ${time}`;
  else if (dayOffset === 1) label = `amanhã às ${time}`;
  return { seconds: Math.max(5, lead * 60), label };
}
