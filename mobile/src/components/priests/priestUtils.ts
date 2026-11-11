import { openExternalUrl } from '../../utils/openExternalUrl';
import type { ToastApi } from '../../context/ToastContext';

// Iniciais para o avatar, ignorando tratamentos ("Pe.", "Padre").
export const initials = (name: string = ''): string =>
  name
    .replace(/^(pe\.?|padre)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Imagens de placeholder.com não são fotos reais: usa-se as iniciais.
export const realImageUri = (url: string | null | undefined): string | null => (url && !/placeholder\.com/i.test(url) ? url : null);

export const openCall = (phone: string, toast?: ToastApi) => openExternalUrl(`tel:${phone.replace(/\D/g, '')}`, toast);

export const openEmail = (email: string, toast?: ToastApi) => openExternalUrl(`mailto:${email}`, toast);
