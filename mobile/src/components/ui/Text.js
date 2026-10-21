import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';
import { withFont } from '../../theme/typography';

// Variantes tipográficas: display/title/heading (serifa Newsreader) e corpo (Figtree).
const variants = StyleSheet.create({
  display: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 40, fontWeight: '500', color: colors.ink, letterSpacing: -0.4 },
  title: { fontFamily: fonts.serif, fontSize: 25, lineHeight: 30, fontWeight: '500', color: colors.ink, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 25, fontWeight: '500', color: colors.ink },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: colors.ink },
  caption: { fontSize: 14, lineHeight: 20, color: colors.muted },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted },
});

// Texto com variante tipográfica.
export function Text({ variant = 'body', style, ...props }) {
  return <RNText {...props} style={withFont([variants[variant], style])} />;
}

// Texto sem variante (só aplica a família correta ao peso pedido).
export function RawText({ style, ...props }) {
  return <RNText {...props} style={withFont(style)} />;
}
