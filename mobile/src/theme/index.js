import { Platform, Appearance } from 'react-native';
import { getLiturgicalSeason } from './liturgy';

// "Vitral Vivo": pergaminho (claro) ou noite (escuro), com destaque na cor do tempo litúrgico.
// Resolvido na abertura do app (tema do sistema + data de hoje).
export const season = getLiturgicalSeason();
export const isDark = Appearance.getColorScheme() === 'dark';

const light = {
  bg: '#F6F1E7',
  surface: '#FFFCF5',
  surfaceWarm: '#FBF4E6',
  ink: '#14110F',
  text: '#14110F',
  muted: '#5C544C',
  line: '#E6DCCB',
  borderLight: '#EFE6D6',
  sand: '#EADFCB',
  primary: season.light,
  tint: season.tint,
  onPrimary: '#FFFFFF',
  hero: '#14110F',
  heroSurface: '#1E1A17',
  heroLine: '#3A322B',
  tabBar: '#14110F',
  tabPill: '#2B2521',
};

const dark = {
  bg: '#100E0C',
  surface: '#1C1815',
  surfaceWarm: '#221D19',
  ink: '#F2EBDF',
  text: '#F2EBDF',
  muted: '#B8AC99',
  line: '#352E28',
  borderLight: '#2A2420',
  sand: '#2A2420',
  primary: season.dark,
  tint: season.tintDark,
  onPrimary: '#14110F',
  hero: '#241E1A',
  heroSurface: '#2E2722',
  heroLine: '#453B33',
  tabBar: '#26201C',
  tabPill: '#3A322B',
};

export const colors = {
  ...(isDark ? dark : light),
  primaryDark: isDark ? dark.hero : light.hero,
  gold: isDark ? '#E0BC6A' : '#8A6A1F',
  goldLight: '#E9CB8C',
  onGold: '#3A0D16',
  cream: '#F6F1E7',
  creamMuted: '#C9BBA3',
  green: '#2F6B4F',
  greenTint: isDark ? '#1C2E25' : '#E3EEE6',
  greenInk: isDark ? '#9AD8B6' : '#1F5139',
  wine: '#7A1E2C',
  violet: '#5B3A8C',
  now: isDark ? '#FF8A80' : '#B3261E',
  danger: isDark ? '#FF8A80' : '#B3261E',
};

// Fraunces (títulos) + Manrope (interface), carregadas em App.js via expo-font.
export const fonts = {
  serif: 'Fraunces_500Medium',
  serifBold: 'Fraunces_600SemiBold',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  sansHeavy: 'Manrope_800ExtraBold',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, xxl: 32, pill: 999 };

// Grade de 4px
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const shadow = Platform.select({
  web: { boxShadow: '0 18px 40px rgba(20,17,15,0.35)' },
  default: {
    shadowColor: '#14110F',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});

// Paleta de avatares/monogramas (todas com texto branco legível).
export const avatarPalette = ['#2F6B4F', '#7A1E2C', '#5B3A8C', '#86621A', '#2D5A7A'];

// Alvo mínimo de toque
export const TOUCH = 44;
