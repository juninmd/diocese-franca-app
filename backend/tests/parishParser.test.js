const fs = require('fs');
const path = require('path');
const { parseParish, parseTitle, parseSocialMedia, parseChapels, splitPeople } = require('../utils/parishParser');

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

describe('socialMedia e chapels parsers', () => {
  it('parseSocialMedia extrai links de redes sociais e whatsapp e recusa esquemas/hosts maliciosos ou enganosos', () => {
    const mockHtml = `<div class="text_post_block">
      <a href="https://www.facebook.com/paroquiamock">Facebook</a>
      <a href="https://www.instagram.com/paroquiamock">Instagram</a>
      <a href="https://www.youtube.com/channel/UC123456">YouTube</a>
      <a href="https://wa.me/5516999998888">WhatsApp</a>
      <a href="javascript:alert(1)">Facebook</a>
      <a href="https://evil.example.com/phishing">Facebook</a>
      <a href="intent://bad#Intent;end">Instagram</a>
    </div>`;
    expect(parseSocialMedia(mockHtml)).toEqual({
      facebook: 'https://www.facebook.com/paroquiamock',
      instagram: 'https://www.instagram.com/paroquiamock',
      youtube: 'https://www.youtube.com/channel/UC123456',
      whatsapp: 'https://wa.me/5516999998888',
    });
  });

  it('parseChapels extrai capelas, comunidades e santuários com endereço', () => {
    const text = `Local e Contato\nDados\nCapela São Benedito\nRua A, 100\nCEP 14400-000\nSantuário Senhor Bom Jesus\nRua B, 200\nCompartilhar`;
    expect(parseChapels(text, '')).toEqual([
      { name: 'Capela São Benedito', address: 'Rua A, 100 - CEP 14400-000' },
      { name: 'Santuário Senhor Bom Jesus', address: 'Rua B, 200' },
    ]);
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

  it('splitPeople separa diáconos e padres unidos por "e", "|" ou ";"', () => {
    expect(splitPeople('Diácono Everton Pereira e Diácono Maurílio Antônio da Silva')).toEqual([
      'Diácono Everton Pereira',
      'Diácono Maurílio Antônio da Silva',
    ]);
    expect(splitPeople('Diácono A | Diácono B | Diácono C')).toEqual([
      'Diácono A',
      'Diácono B',
      'Diácono C',
    ]);
  });
});

describe('parseParish - variações do site', () => {
  const wrap = (body) => `<h2 class="title">Paróquia Teste (Ituverava/SP)</h2><div class="text_post_block">Local e Contato\n${body}\nCompartilhar</div>`;

  it('lê endereço em várias linhas, CEP com espaços e cidade com "/SP"', () => {
    const p = parseParish(
      wrap('Endereço : Rua\nPayaguas, 826. CEP 14 500-000<br>\nCidade/UF : Ituverava/SP<br>\nTelefones: (16)3172 1607 WhatsApp<br>\nDados\nPároco : Pe Alguém<br>\nVigário paroquial : Pe. Um, sjs<br>\nVigário paroquial: Pe. Dois, sjs<br>\nMissas:<br>Domingo: 9h<br>'),
      7
    );
    expect(p).toMatchObject({ address: 'Rua Payaguas - 826', zipCode: '14500-000', city: 'Ituverava', state: 'SP', phone: '(16) 3172-1607' });
    expect(p.clergy.filter((c) => c.title === 'Vigário Paroquial')).toHaveLength(2);
  });

  it('remove caixa postal do endereço', () => {
    const p = parseParish(wrap('Endereço : Praça Hélvio, 193 - C. P. 104<br>\nCidade/UF : Ituverava-SP<br>\nDados\nPároco : Pe. X<br>'), 8);
    expect(p.address).toBe('Praça Hélvio - 193');
  });
});

describe('parseParish - HTML colado do Word (quebras de linha dentro de rótulos)', () => {
  const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'parish_word.html'), 'utf8');
  const parish = parseParish(html, 2047);

  it('reconhece "LOCAL E CONTATO" em maiúsculas e rótulos quebrados em duas linhas', () => {
    expect(parish).toMatchObject({
      name: 'Paróquia Nossa Senhora da Guia',
      city: 'Franca',
      state: 'SP',
      address: 'Avenida João Batista Paula Silva, 471 - Recanto Elimar II',
      zipCode: '14403-300',
      phone: '(16) 99104-6520',
      email: 'nsguia@diocesefranca.org.br',
      foundedAt: '2016-03-05',
    });
    expect(parish.clergy).toEqual([{ name: 'Pe. Josenildo Almeida da Silva', title: 'Pároco' }]);
  });

  it('lê missas e descrição (cabeçalho "DESCRIÇÃO") e para na comunidade', () => {
    expect(parish.masses.map((m) => `${m.dayOfWeek} ${m.time}`)).toEqual(['Domingo 08:30', 'Domingo 18:00', 'Terça-feira 19:30', 'Sábado 19:00']);
    expect(parish.description).toMatch(/^Localizada no Recanto Elimar, em Franca/);
  });
});
