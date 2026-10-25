import { isAllowedScheme, openExternalUrl } from '../openExternalUrl';
import { Linking } from 'react-native';

jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

describe('openExternalUrl helper', () => {
  let toast;

  beforeEach(() => {
    jest.clearAllMocks();
    toast = {
      error: jest.fn(),
    };
  });

  describe('isAllowedScheme', () => {
    it('permite esquemas válidos (https, http, tel, mailto)', () => {
      expect(isAllowedScheme('https://www.diocesefranca.org.br')).toBe(true);
      expect(isAllowedScheme('http://www.diocesefranca.org.br')).toBe(true);
      expect(isAllowedScheme('tel:1637111400')).toBe(true);
      expect(isAllowedScheme('mailto:contato@diocesefranca.org.br')).toBe(true);
    });

    it('recusa esquemas perigosos (javascript, data, intent, file)', () => {
      expect(isAllowedScheme('javascript:alert(1)')).toBe(false);
      expect(isAllowedScheme('data:text/html,test')).toBe(false);
      expect(isAllowedScheme('intent://example.com')).toBe(false);
      expect(isAllowedScheme('file:///etc/passwd')).toBe(false);
      expect(isAllowedScheme('')).toBe(false);
      expect(isAllowedScheme(null)).toBe(false);
    });
  });

  describe('openExternalUrl', () => {
    it('recusa e exibe toast de erro para URL com esquema proibido', async () => {
      const result = await openExternalUrl('javascript:alert(1)', toast);
      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Não foi possível abrir o link.');
      expect(Linking.canOpenURL).not.toHaveBeenCalled();
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('abre URL válida e retorna true quando canOpenURL é verdadeiro', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockResolvedValue(true);

      const result = await openExternalUrl('https://www.diocesefranca.org.br', toast);
      expect(result).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('https://www.diocesefranca.org.br');
      expect(Linking.openURL).toHaveBeenCalledWith('https://www.diocesefranca.org.br');
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('exibe toast de erro quando canOpenURL retorna false', async () => {
      Linking.canOpenURL.mockResolvedValue(false);

      const result = await openExternalUrl('https://invalid.url', toast);
      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Não foi possível abrir o link.');
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('captura erro do Linking.openURL sem lançar exceção não tratada', async () => {
      Linking.canOpenURL.mockResolvedValue(true);
      Linking.openURL.mockRejectedValue(new Error('No app handles scheme'));

      const result = await openExternalUrl('tel:123', toast);
      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Não foi possível abrir o link.');
    });
  });
});
