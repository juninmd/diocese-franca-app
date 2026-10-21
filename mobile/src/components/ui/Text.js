import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

// Variantes tipográficas: display (serifa) e corpo.
const variants = StyleSheet.create({
  display: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, fontWeight: '500', color: colors.ink, letterSpacing: -0.3 },
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28, fontWeight: '500', color: colors.ink },
  heading: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23, fontWeight: '500', color: colors.ink },
  body: { fontSize: 15, lineHeight: 21, color: colors.ink },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600', color: colors.ink },
  caption: { fontSize: 13, lineHeight: 18, color: colors.muted },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.muted },
});

export function Text({ variant = 'body', style, ...props }) {
  return <RNText {...props} style={[variants[variant], style]} />;
}
