const { parseMassLines } = require('./massParser');

// Capelas/comunidades vinculadas à paróquia, com endereço e horários próprios de missa
// (portado do bot juninmd/missas-franca: "Missas : Quintas-feira às 19h / Domingo às 10h30").
const HEADER = /^(c\s?apela|comunidade|santu[aá]rio|quase-par[oó]quia|igreja|mosteiro|convento|orat[oó]rio)\b/i;
const STOP = /^(c\s?apela|comunidade|santu[aá]rio|quase-par[oó]quia|igreja|mosteiro|convento|orat[oó]rio|dados|expediente|itens|compartilhar|descri[çc][ãa]o|atendimento)/i;
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
    const extra = []; // texto após os horários (local/observação): não se perde
    for (let j = i + 1; j < lines.length && j <= i + 10 && !STOP.test(lines[j]); j += 1) {
      const current = lines[j];
      const isMass = MASS_LABEL.test(current) || scheduleish(current) || (massLines.length > 0 && TIME.test(current));
      if (extra.length) extra.push(current); // depois de texto livre, nada vira horário estruturado
      else if (isMass) {
        const rest = current.replace(MASS_LABEL, '').trim();
        if (rest) massLines.push(rest);
      } else if (!massLines.length && addressParts.length < 3) addressParts.push(current);
      else if (!massLines.length) break;
      else if (!addressParts.length) addressParts.push(current);
      else extra.push(current);
    }
    const chapel = { name: line.replace(/^c\s+apela/i, 'Capela'), address: addressParts.join(' - ') || null };
    const { masses, notes } = parseMassLines(massLines);
    if (extra.length) notes.push(extra.join(' - '));
    if (masses.length) chapel.masses = masses;
    if (notes.length) chapel.massNotes = notes;
    chapels.push(chapel);
  }
  return chapels;
}

module.exports = { parseChapels };
