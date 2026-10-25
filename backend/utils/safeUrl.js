const SITE = 'https://www.diocesefranca.org.br';

function hostMatches(hostname, allowedHost) {
  const host = hostname.toLowerCase();
  const allowed = allowedHost.toLowerCase();
  return host === allowed || host.endsWith('.' + allowed);
}

function toHttpsUrl(raw, options = {}) {
  if (!raw || typeof raw !== 'string') return null;
  const site = options.site || SITE;

  let parsedSite;
  try {
    parsedSite = new URL(site);
  } catch (e) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(raw, parsedSite);
  } catch (e) {
    return null;
  }

  if (parsed.protocol === 'http:') {
    const h = parsed.hostname.toLowerCase();
    const siteH = parsedSite.hostname.toLowerCase();
    if (h === siteH || hostMatches(h, siteH) || hostMatches(siteH, h) || h.includes('diocesefranca.org.br')) {
      parsed.protocol = 'https:';
    } else {
      return null;
    }
  } else if (parsed.protocol !== 'https:') {
    return null;
  }

  parsed.username = '';
  parsed.password = '';

  if (options.hosts && Array.isArray(options.hosts) && options.hosts.length > 0) {
    const isAllowed = options.hosts.some((allowedHost) => hostMatches(parsed.hostname, allowedHost));
    if (!isAllowed) return null;
  }

  return parsed.href;
}

module.exports = { toHttpsUrl, SITE };
