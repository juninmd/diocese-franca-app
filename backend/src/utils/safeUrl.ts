export const SITE = 'https://www.diocesefranca.org.br';

export interface SafeUrlOptions {
  /** Base para URLs relativas (padrão: site da Diocese). */
  site?: string;
  /** Se informado, só aceita estes hosts (e subdomínios). */
  hosts?: readonly string[];
}

function hostMatches(hostname: string, allowedHost: string): boolean {
  const host = hostname.toLowerCase();
  const allowed = allowedHost.toLowerCase();
  return host === allowed || host.endsWith('.' + allowed);
}

export function toHttpsUrl(raw: string | null | undefined, options: SafeUrlOptions = {}): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const site = options.site || SITE;

  let parsedSite: URL;
  try {
    parsedSite = new URL(site);
  } catch {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw, parsedSite);
  } catch {
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
