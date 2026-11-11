import axios from 'axios';
import type { Logger } from '../types';

export const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 diocese-franca-app',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.5',
};

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface FetchOptions {
  retries?: number;
  timeout?: number;
  backoff?: number;
  log?: Pick<Logger, 'warn'>;
}

/**
 * GET com tentativas e backoff exponencial. Retorna o corpo ou `''` se todas falharem
 * (erros 404/410 não são repetidos: a página simplesmente não existe).
 */
export async function fetchHtml(url: string, { retries = 3, timeout = 25000, backoff = 1000, log = console }: FetchOptions = {}): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await axios.get<unknown>(url, { timeout, headers: HEADERS, responseType: 'text', transformResponse: (d: unknown) => d });
      return typeof res.data === 'string' ? res.data : '';
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 404 || status === 410) return '';
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === retries) log.warn(`Falha ao buscar ${url}: ${message}${status ? ` (HTTP ${status})` : ''}`);
      else await sleep(backoff * 2 ** (attempt - 1));
    }
  }
  return '';
}
