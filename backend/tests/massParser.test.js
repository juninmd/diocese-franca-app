const { parseMassLines } = require('../utils/massParser');

const slots = (lines) => parseMassLines(lines).masses.map((m) => `${m.dayOfWeek.slice(0, 3)} ${m.time}`);

describe('parseMassLines', () => {
  it('lê dia único com um ou vários horários', () => {
    expect(slots(['Domingo: 09h e 19h'])).toEqual(['Dom 09:00', 'Dom 19:00']);
    expect(slots(['Domingo: 7h, 9h, 10h30, 17h e 19h'])).toEqual(['Dom 07:00', 'Dom 09:00', 'Dom 10:30', 'Dom 17:00', 'Dom 19:00']);
  });

  it('aceita "-feira" separado, listas e intervalos de dias', () => {
    expect(slots(['Terça - feira: 19h'])).toEqual(['Ter 19:00']);
    expect(slots(['Terça, Quarta e Sexta-feira:19h'])).toEqual(['Ter 19:00', 'Qua 19:00', 'Sex 19:00']);
    expect(slots(['Segunda-feira a sábado: 19h'])).toEqual(['Seg 19:00', 'Ter 19:00', 'Qua 19:00', 'Qui 19:00', 'Sex 19:00', 'Sáb 19:00']);
  });

  it('separa vários dias numa mesma linha por "/"', () => {
    expect(slots(['Segunda a sexta-feira: 7h30 / Sábado 8h'])).toEqual(['Seg 07:30', 'Ter 07:30', 'Qua 07:30', 'Qui 07:30', 'Sex 07:30', 'Sáb 08:00']);
  });

  it('manda horários irregulares (ordinais, mês, locais) para as notas', () => {
    const { masses, notes } = parseMassLines(['1ª Sexta-feira: 6h45 e 20h', '2ª Terça-feira: missa no Lar São Vicente de Paulo15h', 'Sábado: 19h']);
    expect(masses).toHaveLength(1);
    expect(notes).toHaveLength(2);
  });

  it('remove duplicados e ordena por dia e horário', () => {
    expect(slots(['Sábado: 19h', 'Domingo: 19h e 7h', 'Sábado: 19h'])).toEqual(['Dom 07:00', 'Dom 19:00', 'Sáb 19:00']);
  });
});
