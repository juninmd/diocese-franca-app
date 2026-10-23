const { normalizeName } = require('../scripts/syncDiocese');

describe('normalizeName', () => {
  it('padroniza tratamento, espaços e sigla da ordem', () => {
    expect(normalizeName('Pe Luciano Resende Caixeta, SJS')).toBe('Pe. Luciano Resende Caixeta, SJS');
    expect(normalizeName('Pe. Gabriel Soares de Souza , sjs')).toBe('Pe. Gabriel Soares de Souza, SJS');
    expect(normalizeName('Frei Joaquim Camilo,OFM')).toBe('Frei Joaquim Camilo, OFM');
  });

  it('remove pontos duplos e títulos extras mantendo nomes próprios como Pedro', () => {
    expect(normalizeName('Pe. . Rafael Canavez de Oliveira')).toBe('Pe. Rafael Canavez de Oliveira');
    expect(normalizeName('Pedro Galdino de Oliveira')).toBe('Pedro Galdino de Oliveira');
    expect(normalizeName('Pe. Raphael Romão - Reitor')).toBe('Pe. Raphael Romão');
  });
});
