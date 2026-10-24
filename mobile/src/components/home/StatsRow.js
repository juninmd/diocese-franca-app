import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui';
import { colors, fonts, radius } from '../../theme';

// Números da diocese; cada item navega para a aba correspondente.
export function StatsRow({ items }) {
  return (
    <View style={styles.row}>
      {items.map((s) => (
        <TouchableOpacity key={s.label} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${s.value} ${s.label}`} style={styles.item} onPress={s.onPress}>
          <Text style={styles.number}>{s.value}</Text>
          <Text variant="caption">{s.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  item: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  number: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '600', color: colors.primary },
});
