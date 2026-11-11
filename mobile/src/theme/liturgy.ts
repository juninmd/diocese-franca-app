// Tempo litúrgico calculado no aparelho: define a cor de destaque do app.

const DAY = 24 * 60 * 60 * 1000;
const at = (y: number, m: number, d: number) => new Date(y, m, d);
const addDays = (date: Date, n: number) => new Date(date.getTime() + n * DAY);

// Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher).
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return at(year, month, day);
}

// 1º Domingo do Advento: quarto domingo antes do Natal.
export function adventStart(year: number): Date {
  const christmas = at(year, 11, 25);
  const back = christmas.getDay() === 0 ? 7 : christmas.getDay();
  return addDays(christmas, -back - 21);
}

// Batismo do Senhor: domingo após 6 de janeiro (no Brasil, segunda se a Epifania cair em 7 ou 8).
function baptismOfTheLord(year: number): Date {
  const jan6 = at(year, 0, 6);
  const toSunday = (7 - jan6.getDay()) % 7 || 7;
  return addDays(jan6, toSunday);
}

export const SEASONS = {
  advent: { key: 'advent', name: 'Advento', light: '#5B3A8C', dark: '#C2A8EE', tint: '#ECE5F5', tintDark: '#2A2236' },
  christmas: { key: 'christmas', name: 'Tempo do Natal', light: '#86621A', dark: '#E6C477', tint: '#F5EBD3', tintDark: '#302818' },
  lent: { key: 'lent', name: 'Quaresma', light: '#5B3A8C', dark: '#C2A8EE', tint: '#ECE5F5', tintDark: '#2A2236' },
  easter: { key: 'easter', name: 'Tempo Pascal', light: '#86621A', dark: '#E6C477', tint: '#F5EBD3', tintDark: '#302818' },
  pentecost: { key: 'pentecost', name: 'Pentecostes', light: '#A3202F', dark: '#F28B95', tint: '#F6E0E1', tintDark: '#3A1D21' },
  ordinary: { key: 'ordinary', name: 'Tempo Comum', light: '#2F6B4F', dark: '#7CC9A0', tint: '#E3EEE6', tintDark: '#1C2E25' },
} as const;

export type LiturgicalSeason = (typeof SEASONS)[keyof typeof SEASONS];

export function getLiturgicalSeason(now: Date = new Date()): LiturgicalSeason {
  const today = at(now.getFullYear(), now.getMonth(), now.getDate());
  const y = today.getFullYear();
  const easter = easterSunday(y);
  const pentecost = addDays(easter, 49);
  const ashWednesday = addDays(easter, -46);
  if (today >= adventStart(y) && today < at(y, 11, 25)) return SEASONS.advent;
  if (today >= at(y, 11, 25) || today <= baptismOfTheLord(y)) return SEASONS.christmas;
  if (today >= ashWednesday && today < addDays(easter, -3)) return SEASONS.lent;
  if (today.getTime() === pentecost.getTime()) return SEASONS.pentecost;
  if (today >= addDays(easter, -3) && today < pentecost) return SEASONS.easter;
  return SEASONS.ordinary;
}
