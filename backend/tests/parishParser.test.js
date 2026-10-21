const fs = require('fs');
const path = require('path');
const { parseParish, parseTitle, splitPeople } = require('../utils/parishParser');

const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'parish.html'), 'utf8');

describe('parseParish', () => {
  const parish = parseParish(html, 2059);

  it('extrai identificação, endereço e contatos', () => {
    expect(parish).toMatchObject({
      sourceId: 2059,
      name: 'Paróquia Exemplo',
      city: 'Franca',
      state: 'SP',
      address: 'Alameda Exemplo, 1735 - Vila Industrial',
      zipCode: '14403-374',
      phone: '(16) 3702-0877',
      email: 'exemplo@diocesefranca.org.br',
      foundedAt: '1968-03-13',
      image: 'https://www.diocesefranca.org.br/images/20210413013822_11.jpg',
    });
    expect(parish.officeHours).toEqual(['Segunda a sexta-feira: 08h às 12h']);
  });

  it('extrai o clero por função', () => {
    expect(parish.clergy).toEqual([
      { name: 'Pe. Fulano de Tal, SJS', title: 'Pároco' },
      { name: 'Pe Beltrano', title: 'Vigário Paroquial' },
      { name: 'Diácono Ciclano', title: 'Diácono' },
      { name: 'Diácono Outro', title: 'Diácono' },
    ]);
  });

  it('separa missas semanais de horários irregulares e ignora capelas', () => {
    expect(parish.masses.map((m) => `${m.dayOfWeek} ${m.time}`)).toEqual(['Domingo 08:00', 'Domingo 19:00', 'Terça-feira 19:00', 'Quarta-feira 19:00']);
    expect(parish.massNotes).toEqual(['3ª Terça-feira do mês, às 15h, Missa da saúde']);
  });

  it('retorna null para páginas que não são de paróquia', () => {
    expect(parseParish('<h2>Notícia</h2>', 1)).toBeNull();
  });
});

describe('helpers', () => {
  it('parseTitle adiciona o prefixo "Paróquia" quando falta', () => {
    expect(parseTitle('Nossa Senhora do Patrocínio (Patrocínio Paulista-SP)')).toEqual({ name: 'Paróquia Nossa Senhora do Patrocínio', city: 'Patrocínio Paulista', state: 'SP' });
    expect(parseTitle('Sé Catedral Nossa Senhora da Conceição (Franca-SP)').name).toBe('Sé Catedral Nossa Senhora da Conceição');
  });

  it('splitPeople preserva a vírgula de siglas ("..., SJS")', () => {
    expect(splitPeople('Pe. A, SJS, Pe. B')).toEqual(['Pe. A, SJS', 'Pe. B']);
  });
});
