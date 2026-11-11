import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, PressableScale } from '../ui';
import { colors, isDark } from '../../theme';
import type { IconName } from '../../types';

// Cores dos atalhos em rodízio (tons litúrgicos suaves).
const TONES: [string, string][] = isDark
  ? [['#302818', '#E6C477'], ['#1C2E25', '#9AD8B6'], ['#2A2236', '#C2A8EE'], ['#3A1D21', '#F28B95']]
  : [['#F5EBD3', '#5A4210'], ['#E3EEE6', '#1F5139'], ['#ECE5F5', '#3E2A63'], ['#F6E0E1', '#5A1421']];

// "Acesso Rápido": carrossel de atalhos; cada item é { icon, label, onPress }.
export interface QuickActionItem {
  icon: IconName;
  label: string;
  onPress: () => void;
}

export function QuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <View style={styles.section}>
      <Text variant="title">Acesso Rápido</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.row}>
        {items.map((item, i) => {
          const [bg, fg] = TONES[i % TONES.length];
          return (
            <PressableScale key={item.icon + item.label} onPress={item.onPress} accessibilityLabel={item.label.replace('\n', ' ')} style={styles.item}>
              <View style={[styles.tile, { backgroundColor: bg }]}><Ionicons name={item.icon} size={24} color={fg} /></View>
              <Text variant="label" style={styles.label}>{item.label}</Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  bleed: { marginHorizontal: -20 },
  row: { gap: 6, paddingHorizontal: 20 },
  item: { width: 84, alignItems: 'center', gap: 8 },
  tile: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12.5, lineHeight: 16, textAlign: 'center', color: colors.ink },
});
