// Converte as linhas de "Missas:" do site da Diocese em horários semanais estruturados.
const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DAY_KEYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const DAY_WORD = /domingo|segunda|terca|quarta|quinta|sexta|sabado|\ba\b|ate|\be\b|[,&]/g;
const TIME = /(\d{1,2})(?:h(\d{2})?|:(\d{2}))(?:min)?/g;

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-\s]*feira/g, '');

const pad = (n) => String(n).padStart(2, '0');

const parseTimes = (text) =>
  [...text.matchAll(TIME)].map((m) => `${pad(m[1])}:${m[2] || m[3] || '00'}`);

// "segunda a sexta", "quarta e quinta", "terca, quarta e sexta" -> índices de dia
const parseDays = (text) => {
  const days = [];
  let range = false;
  for (const token of text.match(DAY_WORD) || []) {
    const index = DAY_KEYS.indexOf(token);
    if (index === -1) {
      range = token === 'a' || token === 'ate';
    } else if (range && days.length) {
      for (let i = days[days.length - 1] + 1; i <= index; i += 1) days.push(i);
      range = false;
    } else {
      days.push(index);
    }
  }
  return days;
};

// Sobra de texto (ordinais, "mês", capelas...) => horário irregular, vai para as notas.
const hasResidual = (text) =>
  /[a-z0-9]/.test(text.replace(DAY_WORD, '').replace(TIME, '').replace(/\bas\b|\bhoras?\b|[\s:.\-–]/g, ''));

function parseMassLines(lines) {
  const masses = [];
  const notes = [];
  for (const line of lines) {
    for (const piece of line.split(/[/;]/).map((p) => p.trim()).filter(Boolean)) {
      const text = normalize(piece);
      const days = parseDays(text);
      const times = parseTimes(text);
      if (!days.length || !times.length || hasResidual(text)) {
        notes.push(piece.replace(/\s+/g, ' '));
        continue;
      }
      days.forEach((d) => times.forEach((time) => masses.push({ dayOfWeek: DAYS[d], time })));
    }
  }
  const seen = new Set();
  const unique = masses.filter((m) => !seen.has(m.dayOfWeek + m.time) && seen.add(m.dayOfWeek + m.time));
  unique.sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.time.localeCompare(b.time));
  return { masses: unique, notes };
}

module.exports = { parseMassLines, DAYS };
