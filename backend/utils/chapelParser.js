const { parseMassLines } = require('./massParser');

// Capelas/comunidades vinculadas à paróquia, com endereço e horários próprios de missa
// (portado do bot juninmd/missas-franca: "Missas : Quintas-feira às 19h / Domingo às 10h30").
const HEADER = /^(capela|comunidade|santu[aá]rio|quase-par[oó]quia|igreja|mosteiro|convento|orat[oó]rio)\b/i;
const STOP = /^(capela|comunidade|santu[aá]rio|quase-par[oó]quia|igreja|mosteiro|convento|orat[oó]rio|dados|expediente|itens|compartilhar|descri[çc][ãa]o|atendimento)/i;
const MASS_LABEL = /^missas?\s*:?\s*/i;
const DAY = /\b(domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado)/i;
const TIME = /\b\d{1,2}\s?(?:h|:\d{2})/i;
const scheduleish = (line) => DAY.test(line) && TIME.test(line);

function parseChapels(text, parishName) {
  const cut = text.indexOf('Compartilhar');
  const body = cut > 0 ? text.slice(0, cut) : text;
  const cutItems = body.indexOf('Itens relacionados');
  const mainText = cutItems > 0 ? body.slice(0, cutItems) : body;
  const lines = mainText.split('\n').map((l) => l.trim()).filter(Boolean);

  const chapels = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!HEADER.test(line) || /^(capela|comunidade)\s+são\s+josé\s+-\s+franca/i.test(line)) continue;
    if (parishName && line.toLowerCase().includes(parishName.toLowerCase())) continue;
    const addressParts = [];
    const massLines = [];
    let j = i + 1;
    while (j < lines.length && !MASS_LABEL.test(lines[j]) && !scheduleish(lines[j]) && !STOP.test(lines[j]) && addressParts.length < 3) {
      addressParts.push(lines[j]);
      j += 1;
    }
    // Horários: "Missas:" (com ou sem texto na mesma linha) e as linhas de dia/horário seguintes.
    while (j < lines.length && !STOP.test(lines[j]) && (MASS_LABEL.test(lines[j]) || scheduleish(lines[j]))) {
      const rest = lines[j].replace(MASS_LABEL, '').trim();
      if (rest) massLines.push(rest);
      j += 1;
    }
    const chapel = { name: line, address: addressParts.join(' - ') || null };
    if (massLines.length) {
      const { masses, notes } = parseMassLines(massLines);
      if (masses.length) chapel.masses = masses;
      if (notes.length) chapel.massNotes = notes;
    }
    chapels.push(chapel);
  }
  return chapels;
}

module.exports = { parseChapels };
