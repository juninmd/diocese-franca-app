const { toHttpsUrl } = require('../utils/safeUrl');

describe('safeUrl - toHttpsUrl', () => {
  it('rejeita esquemas perigosos (javascript:, data:, intent:)', () => {
    expect(toHttpsUrl('javascript:alert(1)')).toBeNull();
    expect(toHttpsUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(toHttpsUrl('intent://example.com#Intent;scheme=http;package=com.example;end')).toBeNull();
    expect(toHttpsUrl('file:///etc/passwd')).toBeNull();
  });

  it('recusa host diferente quando host allowlist é especificada', () => {
    const options = { hosts: ['facebook.com'] };
    expect(toHttpsUrl('https://evil.example.com/facebook', options)).toBeNull();
    expect(toHttpsUrl('https://notfacebook.com', options)).toBeNull();
    expect(toHttpsUrl('https://facebook.com.evil.com', options)).toBeNull();
  });

  it('aceita host exato ou subdomínio quando allowlist é especificada', () => {
    const options = { hosts: ['facebook.com'] };
    expect(toHttpsUrl('https://facebook.com/paroquia', options)).toBe('https://facebook.com/paroquia');
    expect(toHttpsUrl('https://www.facebook.com/paroquia', options)).toBe('https://www.facebook.com/paroquia');
    expect(toHttpsUrl('https://m.facebook.com/paroquia', options)).toBe('https://m.facebook.com/paroquia');
  });

  it('resolve URL relativa usando o site padrão', () => {
    expect(toHttpsUrl('/images/foto.jpg')).toBe('https://www.diocesefranca.org.br/images/foto.jpg');
    expect(toHttpsUrl('?menu=noticia_detalhe&id=10')).toBe('https://www.diocesefranca.org.br/?menu=noticia_detalhe&id=10');
  });

  it('promove http do site oficial para https', () => {
    expect(toHttpsUrl('http://www.diocesefranca.org.br/images/foto.jpg')).toBe('https://www.diocesefranca.org.br/images/foto.jpg');
    expect(toHttpsUrl('http://diocesefranca.org.br/noticia')).toBe('https://diocesefranca.org.br/noticia');
  });

  it('remove credenciais de usuário/senha da URL', () => {
    expect(toHttpsUrl('https://user:password@www.diocesefranca.org.br/secret')).toBe('https://www.diocesefranca.org.br/secret');
  });
});
