import { Linking } from 'react-native';
import { useToast } from '../context/ToastContext';

const ALLOWED_SCHEMES = ['https:', 'http:', 'tel:', 'mailto:'];

export function isAllowedScheme(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_SCHEMES.includes(parsed.protocol.toLowerCase());
  } catch (e) {
    const match = url.trim().match(/^([a-z0-9+.-]+):/i);
    if (!match) return false;
    return ALLOWED_SCHEMES.includes(`${match[1].toLowerCase()}:`);
  }
}

export async function openExternalUrl(url, toast) {
  const notifyError = () => {
    if (toast && typeof toast.error === 'function') {
      toast.error('Não foi possível abrir o link.');
    } else {
      try {
        const t = useToast();
        if (t && typeof t.error === 'function') {
          t.error('Não foi possível abrir o link.');
        }
      } catch (e) {
        // Fallback if toast context is unavailable
      }
    }
  };

  if (!isAllowedScheme(url)) {
    notifyError();
    return false;
  }

  try {
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (!canOpen) {
      notifyError();
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    notifyError();
    return false;
  }
}
