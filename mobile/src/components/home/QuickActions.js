import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors, radius } from '../../theme';

// Grade "Acesso Rápido": cada item é { icon, label, onPress }.
export function QuickActions({ items }) {
  return (
    <View style={styles.section}>
      <Text variant="title">Acesso Rápido</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity key={item.icon + item.label} activeOpacity={0.8} style={styles.item} onPress={item.onPress}>
            <View style={styles.circle}><Ionicons name={item.icon} size={22} color={colors.primary} /></View>
            <Text variant="label" style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: '23%', flexGrow: 1, minHeight: 92, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 4, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint },
  label: { fontSize: 13, lineHeight: 16, textAlign: 'center' },
});
