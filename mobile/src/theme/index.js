import { Platform } from 'react-native';

// Design tokens da nova UI (pergaminho + vinho litúrgico + ouro suave).
export const colors = {
  bg: '#F5F0E6',
  surface: '#FFFCF5',
  ink: '#231F1C',
  muted: '#5C544C',
  line: '#E6DCCB',
  sand: '#EADFCB',
  primary: '#7A1E2C',
  primaryDark: '#5A1421',
  tint: '#F1DEDC',
  gold: '#A67C2E',
  goldLight: '#E9CB8C',
  onGold: '#3A0D16',
  cream: '#FBF4E6',
  creamMuted: '#F0DFC4',
  green: '#2F6B4F',
  greenTint: '#E3EEE6',
  greenInk: '#1F5139',
  danger: '#B3261E',
};

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: "Newsreader, Georgia, serif" }),
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

// Grade de 4px
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const shadow = Platform.select({
  web: { boxShadow: '0 10px 30px rgba(35,31,28,0.14)' },
  default: {
    shadowColor: '#231F1C',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});

// Alvo mínimo de toque
export const TOUCH = 44;
