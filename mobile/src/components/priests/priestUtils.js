import { openExternalUrl } from '../../utils/openExternalUrl';

// Iniciais para o avatar, ignorando tratamentos ("Pe.", "Padre").
export const initials = (name = '') =>
  name
    .replace(/^(pe\.?|padre)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Imagens de placeholder.com não são fotos reais: usa-se as iniciais.
export const realImageUri = (url) => (url && !/placeholder\.com/i.test(url) ? url : null);

export const openCall = (phone, toast) => openExternalUrl(`tel:${phone.replace(/\D/g, '')}`, toast);

export const openEmail = (email, toast) => openExternalUrl(`mailto:${email}`, toast);
