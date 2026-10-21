import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, radius, TOUCH } from '../../theme';

// Filtro selecionável (alvo de toque de 44px).
export function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Etiqueta não interativa (tons: tint | sand | green).
export function Pill({ label, tone = 'tint' }) {
  const t = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.pillText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const pillTones = {
  tint: { bg: colors.tint, fg: colors.primary },
  sand: { bg: '#EFE7D7', fg: colors.muted },
  green: { bg: colors.greenTint, fg: colors.greenInk },
};

const styles = StyleSheet.create({
  chip: { minHeight: TOUCH, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.ink },
  textActive: { color: colors.surface },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  pillText: { fontSize: 12, fontWeight: '600' },
});
