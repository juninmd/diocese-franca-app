const axios = require('axios');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 diocese-franca-app',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.5',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET com tentativas e backoff exponencial. Retorna o corpo ou `''` se todas falharem
 * (erros 404/410 não são repetidos: a página simplesmente não existe).
 */
async function fetchHtml(url, { retries = 3, timeout = 25000, backoff = 1000, log = console } = {}) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await axios.get(url, { timeout, headers: HEADERS, responseType: 'text', transformResponse: (d) => d });
      return typeof res.data === 'string' ? res.data : '';
    } catch (error) {
      const status = error.response && error.response.status;
      if (status === 404 || status === 410) return '';
      if (attempt === retries) log.warn(`Falha ao buscar ${url}: ${error.message}${status ? ` (HTTP ${status})` : ''}`);
      else await sleep(backoff * 2 ** (attempt - 1));
    }
  }
  return '';
}

module.exports = { fetchHtml, sleep, HEADERS };
