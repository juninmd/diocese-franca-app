import type { Church, Mass, Priest } from '../../types';

// Busca universal (sem UI): igrejas, padres, foranias e horários de uma vez só.
export type SearchKind = 'church' | 'priest' | 'forania' | 'mass';

interface SearchResultBase {
  key: string;
  title: string;
  subtitle: string;
}

/** `id` é da igreja (church/mass) ou do padre (priest); `day` é o dia da missa. */
export type SearchResult = SearchResultBase & (
  | { kind: 'church' | 'priest'; id: number }
  | { kind: 'forania'; forania: string }
  | { kind: 'mass'; id: number; day: string }
);

interface SearchInput {
  query: string;
  churches?: Church[];
  priests?: Priest[];
  masses?: Mass[];
}

const norm = (s: string | null | undefined = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TIME = /^(\d{1,2})(?:[:h](\d{0,2}))?$/;

export function searchAll({ query, churches = [], priests = [], masses = [] }: SearchInput, limit = 30): SearchResult[] {
  const q = norm(query.trim());
  if (!q) return [];
  const hit = (...fields: (string | null | undefined)[]) => fields.some((f) => norm(f).includes(q));
  const byId = Object.fromEntries(churches.map((c) => [c.id, c]));
  const out: SearchResult[] = [];

  churches.filter((c) => hit(c.name, c.city, c.address)).forEach((c) =>
    out.push({ key: `c${c.id}`, kind: 'church', title: c.name, subtitle: [c.city, c.forania && `Forania ${c.forania}`].filter(Boolean).join(' · '), id: c.id }));

  priests.filter((p) => hit(p.name, p.title)).forEach((p) =>
    out.push({ key: `p${p.id}`, kind: 'priest', title: p.name, subtitle: [p.title, byId[p.churchId]?.name].filter(Boolean).join(' · '), id: p.id }));

  [...new Set(churches.map((c) => c.forania).filter((f): f is string => Boolean(f)))].filter((f) => hit(f, `forania ${f}`)).forEach((f) =>
    out.push({ key: `f${f}`, kind: 'forania', title: `Forania ${f}`, subtitle: `${churches.filter((c) => c.forania === f).length} paróquias`, forania: f }));

  const t = q.match(TIME);
  if (t) {
    const prefix = `${t[1].padStart(2, '0')}:${t[2] || ''}`;
    masses.filter((m) => m.time?.startsWith(prefix)).slice(0, 12).forEach((m) =>
      out.push({ key: `m${m.id}`, kind: 'mass', title: `${m.time} · ${m.chapel?.name || byId[m.churchId]?.name || 'Missa'}`, subtitle: `${m.dayOfWeek} · ${m.type}`, id: m.churchId, day: m.dayOfWeek }));
  }
  return out.slice(0, limit);
}
