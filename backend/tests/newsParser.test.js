const fs = require('fs');
const path = require('path');
const { parseNews, publishedAtFromImage, formatDate, shortenText } = require('../utils/newsParser');

const html = fs.readFileSync(path.join(__dirname, 'fixtures', 'home.html'), 'utf8');
const NOW = new Date('2026-10-24T12:00:00-03:00');

describe('parseNews', () => {
  const news = parseNews(html, NOW);

  it('lê título, categoria, link e imagem absolutos', () => {
    expect(news[0]).toMatchObject({
      id: 6095,
      title: 'Frei Welton toma posse & "assume" a Paróquia N. Sra. D\'Ajuda',
      category: 'Frei Welton',
      link: 'https://diocesefranca.org.br/?menu=noticia_detalhe&id=6095&id_orgao=1',
      image: 'https://diocesefranca.org.br/images/20261019202902_1000388427.png',
      description: 'Celebração foi presidida por Dom Paulo, no sábado (17), em Franca',
    });
  });

  it('deriva a data de publicação do nome da imagem (sem inventar "hoje")', () => {
    expect(news[0].publishedAt).toBe('2026-10-19T20:29:02-03:00');
    expect(news[0].date).toBe('19 de outubro');
    expect(news[1].publishedAt).toBeNull();
    expect(news[1].date).toBe('');
  });

  it('usa o primeiro parágrafo com texto e encurta no limite de palavra', () => {
    expect(news[1].description.endsWith('…')).toBe(true);
    expect(news[1].description.length).toBeLessThanOrEqual(161);
    expect(news[1].description).toMatch(/^Encontro realizado/);
  });

  it('codifica imagens com espaço e descarta itens sem título/link e links repetidos', () => {
    expect(news[1].image).toBe('https://diocesefranca.org.br/images/sem%20data%20nenhuma.png');
    expect(news.map((n) => n.id)).toEqual([6095, 6001]);
  });

  it('retorna lista vazia para HTML vazio ou sem notícias', () => {
    expect(parseNews('', NOW)).toEqual([]);
    expect(parseNews('<html><body>nada</body></html>', NOW)).toEqual([]);
  });
});

describe('datas', () => {
  it('rejeita carimbos impossíveis no nome da imagem', () => {
    expect(publishedAtFromImage('images/20261340120000_x.png')).toBeNull();
    expect(publishedAtFromImage('images/foto.png')).toBeNull();
    expect(publishedAtFromImage(null)).toBeNull();
  });

  it('inclui o ano quando não é o corrente', () => {
    expect(formatDate('2025-03-02T10:00:00-03:00', NOW)).toBe('2 de março de 2025');
    expect(formatDate('2026-03-02T10:00:00-03:00', NOW)).toBe('2 de março');
  });

  it('shortenText não corta no meio da palavra', () => {
    expect(shortenText('uma frase curta')).toBe('uma frase curta');
    expect(shortenText('palavra '.repeat(30), 20)).toBe('palavra palavra…');
  });
});
