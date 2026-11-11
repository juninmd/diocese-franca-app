import { applyDepara } from './applyDepara';
import { readCached } from './fileStore';
import type { Catalog, Church, Depara, Mass, Priest } from '../types';

// Catálogo servido pela API: dados base + de-para (data/depara.json), com índices por id.
// Reconstruído apenas quando algum dos JSONs muda no disco (ver fileStore.readCached).
let built: Catalog | null = null;

export function getCatalog(): Catalog {
  const rawChurches = readCached<Church[]>('churches.json', []);
  const rawPriests = readCached<Priest[]>('priests.json', []);
  const masses = readCached<Mass[]>('masses.json', []);
  const depara = readCached<Depara>('depara.json', {});
  const sources = [rawChurches, rawPriests, masses, depara];
  if (built && built.sources.every((source, i) => source === sources[i])) return built;

  const churches = applyDepara(rawChurches, depara.churches);
  const priests = applyDepara(rawPriests, depara.priests);
  const churchesById = new Map(churches.map((c) => [c.id, c]));
  const massesByChurch = new Map<number, Mass[]>();
  masses.forEach((m) => {
    const list = massesByChurch.get(m.churchId);
    if (list) list.push(m);
    else massesByChurch.set(m.churchId, [m]);
  });
  built = { sources, churches, priests, masses, churchesById, massesByChurch };
  return built;
}
