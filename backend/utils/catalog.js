const { applyDepara } = require('./applyDepara');
const { readCached } = require('./fileStore');

// Catálogo servido pela API: dados base + de-para (data/depara.json), com índices por id.
// Reconstruído apenas quando algum dos JSONs muda no disco (ver fileStore.readCached).
let built = null;

function getCatalog() {
  const sources = [readCached('churches.json', []), readCached('priests.json', []), readCached('masses.json', []), readCached('depara.json', {})];
  if (built && built.sources.every((source, i) => source === sources[i])) return built;

  const [rawChurches, rawPriests, masses, depara] = sources;
  const churches = applyDepara(rawChurches, depara.churches);
  const priests = applyDepara(rawPriests, depara.priests);
  const churchesById = new Map(churches.map((c) => [c.id, c]));
  const massesByChurch = new Map();
  masses.forEach((m) => {
    if (!massesByChurch.has(m.churchId)) massesByChurch.set(m.churchId, []);
    massesByChurch.get(m.churchId).push(m);
  });
  built = { sources, churches, priests, masses, churchesById, massesByChurch };
  return built;
}

module.exports = {
  getCatalog,
  get churches() { return getCatalog().churches; },
  get priests() { return getCatalog().priests; },
  get masses() { return getCatalog().masses; },
};
