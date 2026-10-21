import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors, radius, TOUCH } from '../../theme';

// Linha de contato/ação do detalhe: ícone em tinta, rótulo, valor e ícone de ação.
export function ContactRow({ icon, label, value, trailing = 'open-outline', onPress, last }) {
  return (
    <TouchableOpacity activeOpacity={0.8} accessibilityRole="button" style={[styles.row, !last && styles.divider]} onPress={onPress}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text variant="caption">{label}</Text>
        <Text variant="label">{value}</Text>
      </View>
      <Ionicons name={trailing} size={18} color={colors.gold} />
    </TouchableOpacity>
  );
}

// Cartão de superfície que agrupa linhas.
export function Panel({ children, style }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, padding: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { width: TOUCH, height: TOUCH, borderRadius: 14, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, gap: 2 },
});
