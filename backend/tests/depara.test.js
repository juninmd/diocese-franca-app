const { applyDepara } = require('../utils/applyDepara');
const catalog = require('../utils/catalog');
const depara = require('../data/depara.json');

describe('applyDepara', () => {
  const base = [
    { id: 1, name: 'A', phone: '1', image: 'https://via.placeholder.com/400x300?text=A' },
    { id: 2, name: 'B', image: 'https://via.placeholder.com/400x300?text=B' },
  ];

  it('sobrescreve campos do registro base e mantém os demais', () => {
    const [a] = applyDepara(base, { 1: { phone: '2', email: 'a@x.org' } });
    expect(a).toMatchObject({ id: 1, name: 'A', phone: '2', email: 'a@x.org' });
  });

  it('descarta imagens placeholder e aceita imagem real do de-para', () => {
    const [a, b] = applyDepara(base, { 1: { image: 'https://exemplo.org/a.jpg' } });
    expect(a.image).toBe('https://exemplo.org/a.jpg');
    expect(b.image).toBeNull();
  });

  it('não altera o id nem o array original', () => {
    const result = applyDepara(base, { 1: { id: 99, phone: '3' } });
    expect(result[0].id).toBe(1);
    expect(base[0].phone).toBe('1');
  });
});

describe('catálogo com de-para', () => {
  it('toda paróquia do de-para existe no catálogo base', () => {
    Object.keys(depara.churches).forEach((id) => {
      expect(catalog.churches.some((c) => String(c.id) === id)).toBe(true);
    });
  });

  it('nenhuma igreja ou padre é servido com imagem placeholder', () => {
    [...catalog.churches, ...catalog.priests].forEach((item) => {
      expect(item.image || '').not.toMatch(/placeholder\.com/);
    });
  });

  it('usa imagens https do de-para nas paróquias com foto', () => {
    Object.keys(depara.churches).forEach((id) => {
      const church = catalog.churches.find((c) => String(c.id) === id);
      expect(church.image).toMatch(/^https:\/\//);
    });
  });
});
