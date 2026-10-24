const { buildCatalog, normalizeName } = require('../utils/catalogBuilder');

const parish = (sourceId, name, clergy, masses = []) => ({
  sourceId, name, city: 'Franca', state: 'SP', address: 'Rua A, 1', phone: '(16) 3700-0000', email: null,
  clergy, masses, massNotes: [],
});

describe('buildCatalog', () => {
  const parishes = [
    parish(10, 'Paróquia A', [{ name: 'Pe Fulano de Tal SJS', title: 'Pároco' }, { name: 'Pe. Fulano de Tal, SJS', title: 'Vigário Paroquial' }],
      [{ dayOfWeek: 'Domingo', time: '08:00' }, { dayOfWeek: 'Quarta-feira', time: '19:00' }]),
    parish(11, 'Paróquia B', [{ name: 'Pe. Fulano de Tal, SJS', title: 'Pároco' }, { name: 'Diácono Beltrano', title: 'Diácono' }]),
  ];
  const catalog = buildCatalog(parishes, { 'Franca|SP': [-20.5, -47.4] }, { name: 'Dom Bispo', phone: '(16) 3701-0222', bio: 'Bio.' });

  it('gera igrejas com coordenadas da cidade e missas tipadas', () => {
    expect(catalog.churches.map((c) => [c.id, c.latitude, c.longitude, c.coordinatesPrecision])).toEqual([[10, -20.5, -47.4, 'city'], [11, -20.5, -47.4, 'city']]);
    expect(catalog.churches[0]).not.toHaveProperty('clergy');
    expect(catalog.masses).toEqual([
      { id: 1, churchId: 10, dayOfWeek: 'Domingo', time: '08:00', type: 'Missa Dominical' },
      { id: 2, churchId: 10, dayOfWeek: 'Quarta-feira', time: '19:00', type: 'Missa Semanal' },
    ]);
  });

  it('unifica o mesmo padre em várias paróquias (churchIds) e coloca o bispo primeiro', () => {
    expect(catalog.priests.map((p) => p.name)).toEqual(['Dom Bispo', 'Pe. Fulano de Tal, SJS', 'Diácono Beltrano']);
    expect(catalog.priests[1]).toMatchObject({ title: 'Pároco', churchId: 10, churchIds: [10, 11] });
    expect(catalog.priests[0].churchIds).toEqual([2080]);
  });

  it('funciona sem bispo e sem coordenadas', () => {
    const result = buildCatalog([parish(12, 'Paróquia C', [])], {}, null);
    expect(result.priests).toEqual([]);
    expect(result.churches[0]).toMatchObject({ latitude: null, longitude: null });
  });
});

describe('normalizeName', () => {
  it('põe vírgula antes de siglas de ordem coladas ao nome', () => {
    expect(normalizeName('Frei Fernando Aparecido dos Santos OFM')).toBe('Frei Fernando Aparecido dos Santos, OFM');
    expect(normalizeName('Pe. Fulano II')).toBe('Pe. Fulano II');
    expect(normalizeName('Diácono João SILVA')).toBe('Diácono João SILVA');
  });
});

describe('ids estáveis de padres', () => {
  it('reaproveita o id de quem já existia e numera novos a partir do maior id', () => {
    const parishes = [{
      sourceId: 10, name: 'Paróquia A', city: 'Franca', state: 'SP', address: 'Rua A', phone: null, email: null, masses: [], massNotes: [],
      clergy: [{ name: 'Pe. Novo', title: 'Pároco' }, { name: 'Pe. Antigo', title: 'Vigário Paroquial' }],
    }];
    const previous = [{ id: 7, name: 'Pe. Antigo' }, { id: 42, name: 'Pe. Removido' }];
    const { priests } = buildCatalog(parishes, {}, null, previous);
    expect(Object.fromEntries(priests.map((p) => [p.name, p.id]))).toEqual({ 'Pe. Antigo': 7, 'Pe. Novo': 43 });
  });
});
