const { normalizeName } = require('../scripts/syncDiocese');

describe('normalizeName', () => {
  it('padroniza tratamento, espaços e sigla da ordem', () => {
    expect(normalizeName('Pe Luciano Resende Caixeta, SJS')).toBe('Pe. Luciano Resende Caixeta, SJS');
    expect(normalizeName('Pe. Gabriel Soares de Souza , sjs')).toBe('Pe. Gabriel Soares de Souza, SJS');
    expect(normalizeName('Frei Joaquim Camilo,OFM')).toBe('Frei Joaquim Camilo, OFM');
  });
});
