import { parseChapels } from '../src/utils/chapelParser';
import { parseMassLines } from '../src/utils/massParser';
import { cleanAddress, queriesFor } from '../src/utils/geocode';
import { buildCatalog, parseBishopPage } from '../src/utils/catalogBuilder';
import type { ParsedParish } from '../src/types';

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

  it('tolera "Quata" (erro de digitação do site) como quarta-feira', () => {
    expect(parseMassLines(['Quata e quinta-feira : 19h30']).masses.map((m) => m.dayOfWeek)).toEqual(['Quarta-feira', 'Quinta-feira']);
  });

  it('aceita dias no plural', () => {
    expect(parseMassLines(['Domingos e Quartas-feiras: 19h']).masses.map((m) => m.dayOfWeek)).toEqual(['Domingo', 'Quarta-feira']);
  });
});

describe('geocode por endereço', () => {
  it('limpa o endereço e monta consultas da matriz', () => {
    expect(cleanAddress('Rua Sacramento, n°605 - Jardim Pedreira')).toBe('Rua Sacramento, 605, Jardim Pedreira');
    expect(queriesFor({ id: 1, name: 'Paróquia São José', address: 'Rua A, 1', city: 'Franca', state: 'SP' })).toEqual([
      'Rua A, 1, Franca, SP', 'Igreja São José, Franca, SP', 'Paróquia São José, Franca, SP',
    ]);
  });

  it('buildCatalog usa a coordenada do endereço quando bate com o endereço atual', () => {
    const p = (sourceId: number, address: string) => ({ sourceId, name: `P${sourceId}`, city: 'Franca', state: 'SP', address, clergy: [], masses: [] }) as unknown as ParsedParish;
    const addr = { 1: { address: 'Rua A, 1', latitude: -20.53, longitude: -47.39 }, 2: { address: 'Rua antiga', latitude: 1, longitude: 1 } };
    const { churches } = buildCatalog([p(1, 'Rua A, 1'), p(2, 'Rua nova')], { 'Franca|SP': [-20.5, -47.4] }, null, [], new Map(), new Map(), addr);
    expect(churches.map((c) => [c.latitude, c.longitude, c.coordinatesPrecision])).toEqual([[-20.53, -47.39, 'address'], [-20.5, -47.4, 'city']]);
  });

  it('coordenada fixada à mão (manual) vale mesmo com endereço diferente e respeita a precisão', () => {
    const p = { sourceId: 3, name: 'P3', city: 'Franca', state: 'SP', address: 'Rua X, 10', clergy: [], masses: [] } as unknown as ParsedParish;
    const addr = { 3: { address: 'Rua X', latitude: -20.51, longitude: -47.42, manual: true, precision: 'street' as const } };
    const { churches } = buildCatalog([p], { 'Franca|SP': [-20.5, -47.4] }, null, [], new Map(), new Map(), addr);
    expect([churches[0].latitude, churches[0].longitude, churches[0].coordinatesPrecision]).toEqual([-20.51, -47.42, 'street']);
  });
});

describe('bispo', () => {
  it('lê nascimento e ordenação presbiteral da página (não a data de posse)', () => {
    const html = `<p>Bispo atual - Dom Fulano de Tal</p><p>4º Bispo Diocesano</p><p>Nascido em Adamantina/SP - 09/04/1957</p>
      <p>Ordenado Presbítero: 29/06/1986</p><p>Ordenado Bispo: 04/02/2006</p><p>Nomeado Bispo de Franca/SP - 23/10/2013</p><p>Posse: 15/12/2013</p><p>Fone: (16) 3701-0222</p>`;
    expect(parseBishopPage(html)).toMatchObject({ name: 'Dom Fulano de Tal', birthDate: '09/04/1957', ordinationDate: '29/06/1986', phone: '(16) 3701-0222' });
  });
});
