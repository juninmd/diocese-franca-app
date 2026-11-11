import { FORANIAS, FORANIA_DEFAULTS } from '../src/utils/dioceseEnricher';
import { buildCatalog } from '../src/utils/catalogBuilder';
import type { CityCoords } from '../src/types';
import { parishFixture } from './parishFixture';

describe('dioceseEnricher & buildCatalog enrichment', () => {
  it('contém a lista oficial das 5 foranias da diocese de franca', () => {
    expect(FORANIAS).toHaveLength(5);
    const names = FORANIAS.map((f) => f.name);
    expect(names).toContain('Beata Rita Amada de Jesus');
    expect(names).toContain('Nossa Senhora Aparecida');
    expect(names).toContain('Nossa Senhora da Conceição');
    expect(names).toContain('Santa Gianna');
    expect(names).toContain('São Joaquim');
  });

  it('buildCatalog associa forania e priestAttendance nas paróquias', () => {
    const parishes = [
      parishFixture({
        sourceId: 2080,
        name: 'Sé Catedral',
        city: 'Franca',
        state: 'SP',
        clergy: [{ name: 'Pe. Teste', title: 'Pároco' }],
        masses: [{ dayOfWeek: 'Domingo', time: '10:00' }],
        officeHours: ['8h - 17h'],
        priestAttendance: ['Terça-feira: 14h - 17h'],
      }),
    ];
    const coords: CityCoords = { 'Franca|SP': [-20.53, -47.40] };
    const foraniaMap = new Map([[2080, 'Nossa Senhora da Conceição']]);
    const clergyDir = new Map([
      ['pe. teste', { name: 'Pe. Teste', birthDate: '01/01/1980', ordinationDate: '01/01/2005', image: 'https://site/foto.jpg' }],
    ]);

    const catalog = buildCatalog(parishes, coords, null, [], foraniaMap, clergyDir);
    expect(catalog.churches[0].forania).toBe('Nossa Senhora da Conceição');
    expect(catalog.churches[0].priestAttendance).toEqual(['Terça-feira: 14h - 17h']);

    const priest = catalog.priests[0];
    expect(priest.birthDate).toBe('01/01/1980');
    expect(priest.ordinationDate).toBe('01/01/2005');
    expect(priest.image).toBe('https://site/foto.jpg');
  });

  it('possui mapeamentos canônicos padrão em FORANIA_DEFAULTS para todas as 6 paróquias periféricas', () => {
    expect(FORANIA_DEFAULTS[2046]).toBe('Santa Gianna');
    expect(FORANIA_DEFAULTS[2052]).toBe('Santa Gianna');
    expect(FORANIA_DEFAULTS[2054]).toBe('Santa Gianna');
    expect(FORANIA_DEFAULTS[2055]).toBe('Santa Gianna');
    expect(FORANIA_DEFAULTS[2056]).toBe('Santa Gianna');
    expect(FORANIA_DEFAULTS[2079]).toBe('Santa Gianna');
  });
});
