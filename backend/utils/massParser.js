// Converte as linhas de "Missas:" do site da Diocese em horários semanais estruturados.
const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DAY_KEYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
// "19h", "19h30", "7hs", "19 h", "19:30", "19h30min"
const TIME_SOURCE = '(\\d{1,2})(?:\\s?h(?:s|oras?)?(?![a-z])(\\d{2})?|:(\\d{2}))(?:min)?';
const TOKENS = new RegExp(`(${DAY_KEYS.join('|')})|\\b(a|ate)\\b|${TIME_SOURCE}`, 'g');
const JOINERS = /\ba\b|\bate\b|\be\b|[,&]/g;

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-–\s]*feira/g, '');

const pad = (n) => String(n).padStart(2, '0');

// Sobra de texto (ordinais, "mês", capelas...) => horário irregular, vai para as notas.
const hasResidual = (text) =>
  /[a-z0-9]/.test(
    text
      .replace(new RegExp(TIME_SOURCE, 'g'), '')
      .replace(new RegExp(DAY_KEYS.join('|'), 'g'), '')
      .replace(JOINERS, '')
      .replace(/\bas\b|\bhoras?\b|[\s:.\-–]/g, '')
  );

/**
 * Divide um trecho em blocos { days, times }: um novo bloco começa quando aparece um dia
 * depois de já haver horário ("Quinta às 19h30 e Domingo às 10h" => dois blocos).
 * "segunda a sexta" vira o intervalo de índices.
 */
function segments(text) {
  const result = [];
  let current = { days: [], times: [] };
  let range = false;
  for (const m of text.matchAll(TOKENS)) {
    if (m[1]) {
      if (current.times.length) {
        result.push(current);
        current = { days: [], times: [] };
      }
      const index = DAY_KEYS.indexOf(m[1]);
      const last = current.days[current.days.length - 1];
      if (range && last !== undefined && index > last) {
        for (let i = last + 1; i <= index; i += 1) current.days.push(i);
      } else {
        current.days.push(index);
      }
      range = false;
    } else if (m[2]) {
      range = true;
    } else {
      const hour = Number(m[3]);
      const minute = Number(m[4] || m[5] || 0);
      if (hour < 24 && minute < 60) current.times.push(`${pad(hour)}:${pad(minute)}`);
      range = false;
    }
  }
  if (current.days.length || current.times.length) result.push(current);
  return result;
}

const union = (a, b) => [...new Set([...(a || []), ...b])];

function parseMassLines(lines) {
  const masses = [];
  const notes = [];
  let pending = null; // { days, line }: trecho só com dias ("Terça /", "Domingo") que vale para o seguinte
  lines.forEach((line, lineIndex) => {
    let lineDays = null; // dias do trecho anterior da mesma linha ("Segunda: 6h; 11h e 19h")
    let lastWasNote = false;
    for (const piece of line.split(/[/;]/).map((p) => p.trim()).filter(Boolean)) {
      const text = normalize(piece);
      const blocks = hasResidual(text) ? [] : segments(text);
      if (!blocks.length) {
        notes.push(piece.replace(/\s+/g, ' '));
        pending = null;
        lastWasNote = true;
        continue;
      }
      if (!/\d/.test(text)) {
        const same = pending && pending.line === lineIndex ? pending.days : [];
        pending = { days: union(same, blocks.flatMap((b) => b.days)), line: lineIndex };
        continue;
      }
      const carried = pending && (pending.line === lineIndex || !blocks[0].days.length) ? pending.days : null;
      const inherited = carried || lineDays;
      const resolved = blocks.map((block, i) => ({
        times: block.times,
        days: block.days.length ? (i === 0 ? union(carried, block.days) : block.days) : inherited,
      }));
      pending = null;
      if (resolved.some((b) => !b.days || !b.days.length || !b.times.length)) {
        // Horários soltos logo após um trecho irregular ("Quinta: Celebração: 6h; 11h e 19h") continuam a mesma nota.
        const orphan = lastWasNote && !blocks[0].days.length && notes.length;
        if (orphan) notes[notes.length - 1] += `; ${piece.replace(/\s+/g, ' ')}`;
        else notes.push(piece.replace(/\s+/g, ' '));
        lastWasNote = true;
        continue;
      }
      lastWasNote = false;
      resolved.forEach(({ days, times }) => days.forEach((d) => times.forEach((time) => masses.push({ dayOfWeek: DAYS[d], time }))));
      lineDays = resolved[resolved.length - 1].days;
    }
  });
  const seen = new Set();
  const unique = masses.filter((m) => !seen.has(m.dayOfWeek + m.time) && seen.add(m.dayOfWeek + m.time));
  unique.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.time.localeCompare(b.time));
  return { masses: unique, notes };
}

module.exports = { parseMassLines, DAYS };
