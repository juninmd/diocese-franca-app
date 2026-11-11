const { parseChapels } = require('../utils/chapelParser');
const { parseMassLines } = require('../utils/massParser');
const { cleanAddress, queriesFor } = require('../utils/geocode');
const { buildCatalog } = require('../utils/catalogBuilder');

describe('capelas com horários próprios', () => {
  it('lê "Missas :" da capela (plural "Quintas-feira") sem engolir no endereço', () => {
    const text = 'Capela Divino Pai Eterno\nRua Rio Tocantins, 1470, Residencial Amazonas\nMissas : Quintas-feira às 19h\nDomingo às 10h30\nItens relacionados';
    expect(parseChapels(text, '')).toEqual([{
      name: 'Capela Divino Pai Eterno',
      address: 'Rua Rio Tocantins, 1470, Residencial Amazonas',
      masses: [{ dayOfWeek: 'Domingo', time: '10:30' }, { dayOfWeek: 'Quinta-feira', time: '19:00' }],
    }]);
  });

  it('horário sem rótulo logo após o endereço e texto irregular vira nota', () => {
    const text = 'Comunidade São Pedro\nRua B, 2\nSábado: 17h\n1º domingo do mês: 8h\nCapela X\nRua C';
    expect(parseChapels(text, '')).toEqual([
      { name: 'Comunidade São Pedro', address: 'Rua B, 2', masses: [{ dayOfWeek: 'Sábado', time: '17:00' }], massNotes: ['1º domingo do mês: 8h'] },
      { name: 'Capela X', address: 'Rua C' },
    ]);
  });

  it('local informado depois do horário vira endereço; "Todo dia 22" fica como nota', () => {
    const text = 'Capela A\n2ª Quarta-feira do mês, às 19h30.\nAv. São Vicente, 7316\nCapela B\nRua D\nTerça-feira: 19h\nTodo dia 22: 19h\nDados';
    expect(parseChapels(text, '')).toEqual([
      { name: 'Capela A', address: 'Av. São Vicente, 7316', massNotes: ['2ª Quarta-feira do mês, às 19h30.'] },
      { name: 'Capela B', address: 'Rua D', masses: [{ dayOfWeek: 'Terça-feira', time: '19:00' }], massNotes: ['Todo dia 22: 19h'] },
    ]);
  });

  it('aceita dias no plural', () => {
    expect(parseMassLines(['Domingos e Quartas-feiras: 19h']).masses.map((m) => m.dayOfWeek)).toEqual(['Domingo', 'Quarta-feira']);
  });
});

describe('geocode por endereço', () => {
  it('limpa o endereço e monta consultas da matriz', () => {
    expect(cleanAddress('Rua Sacramento, n°605 - Jardim Pedreira')).toBe('Rua Sacramento, 605, Jardim Pedreira');
    expect(queriesFor({ name: 'Paróquia São José', address: 'Rua A, 1', city: 'Franca', state: 'SP' })).toEqual([
      'Rua A, 1, Franca, SP', 'Igreja São José, Franca, SP', 'Paróquia São José, Franca, SP',
    ]);
  });

  it('buildCatalog usa a coordenada do endereço quando bate com o endereço atual', () => {
    const p = (sourceId, address) => ({ sourceId, name: `P${sourceId}`, city: 'Franca', state: 'SP', address, clergy: [], masses: [] });
    const addr = { 1: { address: 'Rua A, 1', latitude: -20.53, longitude: -47.39 }, 2: { address: 'Rua antiga', latitude: 1, longitude: 1 } };
    const { churches } = buildCatalog([p(1, 'Rua A, 1'), p(2, 'Rua nova')], { 'Franca|SP': [-20.5, -47.4] }, null, [], new Map(), new Map(), addr);
    expect(churches.map((c) => [c.latitude, c.longitude, c.coordinatesPrecision])).toEqual([[-20.53, -47.39, 'address'], [-20.5, -47.4, 'city']]);
  });
});
