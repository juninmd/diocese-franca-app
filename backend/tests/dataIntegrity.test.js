// Valida os JSONs versionados (saída do scraper): referências, formatos e duplicidades.
const churches = require('../data/churches.json');
const priests = require('../data/priests.json');
const masses = require('../data/masses.json');
const news = require('../data/news.json');
const cityCoords = require('../data/cityCoords.json');
const { DAYS } = require('../utils/massParser');

const ids = (list) => list.map((item) => item.id);
const duplicates = (values) => values.filter((v, i) => values.indexOf(v) !== i);

describe('integridade dos dados', () => {
  it('ids são únicos em cada coleção', () => {
    [churches, priests, masses, news].forEach((list) => expect(duplicates(ids(list))).toEqual([]));
  });

  it('paróquias têm nome, cidade, endereço e coordenadas numéricas', () => {
    churches.forEach((c) => {
      expect(c.name).toBeTruthy();
      expect(c.city).toBeTruthy();
      expect(c.address).toBeTruthy();
      expect(c.state).toMatch(/^[A-Z]{2}$/);
      expect(typeof c.latitude).toBe('number');
      expect(typeof c.longitude).toBe('number');
      if (c.zipCode) expect(c.zipCode).toMatch(/^\d{5}-\d{3}$/);
      if (c.phone) expect(c.phone).toMatch(/^\(\d{2}\) \d{4,5}-\d{4}$/);
      if (c.email) expect(c.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      if (c.foundedAt) expect(c.foundedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (c.socialMedia) {
        expect(typeof c.socialMedia).toBe('object');
        if (c.socialMedia.facebook) expect(c.socialMedia.facebook).toMatch(/^https?:\/\//);
        if (c.socialMedia.instagram) expect(c.socialMedia.instagram).toMatch(/^https?:\/\//);
        if (c.socialMedia.youtube) expect(c.socialMedia.youtube).toMatch(/^https?:\/\//);
      }
      if (c.chapels) {
        expect(Array.isArray(c.chapels)).toBe(true);
        c.chapels.forEach((chapel) => expect(chapel.name).toBeTruthy());
      }
    });
  });

  it('toda cidade das paróquias tem coordenadas em cityCoords', () => {
    churches.forEach((c) => expect(cityCoords[`${c.city}|${c.state}`]).toBeDefined());
  });

  it('coordenadas ficam na região da diocese (SP/MG, norte do estado)', () => {
    churches.forEach((c) => {
      expect(c.latitude).toBeGreaterThan(-21.5);
      expect(c.latitude).toBeLessThan(-19.5);
      expect(c.longitude).toBeGreaterThan(-48.5);
      expect(c.longitude).toBeLessThan(-46.5);
    });
  });

  it('missas referenciam paróquias existentes, com dia válido e horário HH:MM', () => {
    const churchIds = new Set(ids(churches));
    masses.forEach((m) => {
      expect(churchIds.has(m.churchId)).toBe(true);
      expect(DAYS).toContain(m.dayOfWeek);
      expect(m.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(m.type).toBe(m.dayOfWeek === 'Domingo' ? 'Missa Dominical' : 'Missa Semanal');
    });
    expect(duplicates(masses.map((m) => `${m.churchId}|${m.dayOfWeek}|${m.time}`))).toEqual([]);
  });

  it('padres referenciam paróquias existentes e têm nome e função', () => {
    const churchIds = new Set(ids(churches));
    priests.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(churchIds.has(p.churchId)).toBe(true);
      (p.churchIds || []).forEach((id) => expect(churchIds.has(id)).toBe(true));
      expect(p.name).not.toMatch(/\s{2,}|,,|\s,|^\s|\s$/);
    });
    expect(duplicates(priests.map((p) => p.name))).toEqual([]);
  });

  it('há um bispo diocesano e toda paróquia com pároco ou administrador', () => {
    expect(priests.filter((p) => p.title === 'Bispo Diocesano')).toHaveLength(1);
    const lead = new Set(priests.filter((p) => /pároco|administrador|reitor/i.test(p.title)).flatMap((p) => p.churchIds || [p.churchId]));
    churches.forEach((c) => expect(lead.has(c.id)).toBe(true));
  });

  it('notícias têm link da matéria, título e data coerente', () => {
    news.forEach((n) => {
      expect(n.title).toBeTruthy();
      expect(n.link).toMatch(/^https:\/\/(www\.)?diocesefranca\.org\.br\/\?menu=noticia_detalhe&id=\d+/);
      if (n.publishedAt) expect(Number.isNaN(Date.parse(n.publishedAt))).toBe(false);
      if (n.image) expect(n.image).toMatch(/^https:\/\//);
    });
  });

  it('nenhum link em data/*.json tem esquema fora de https (ou tel/mailto quando aplicável)', () => {
    const isUrlKey = (key) => ['link', 'website', 'image', 'facebook', 'instagram', 'youtube'].includes(key);
    const checkObj = (obj) => {
      if (!obj) return;
      if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, val]) => {
          if (isUrlKey(key) && typeof val === 'string') {
            expect(val).toMatch(/^(https|tel|mailto):/i);
          } else {
            checkObj(val);
          }
        });
      }
    };
    [churches, priests, masses, news].forEach(checkObj);
  });
});
