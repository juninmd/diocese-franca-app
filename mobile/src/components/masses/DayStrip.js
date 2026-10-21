import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui';
import { colors, fonts } from '../../theme';

// Faixa horizontal com os 7 dias da semana; o dia atual leva um ponto.
export function DayStrip({ days, selected, onSelect }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Dia da semana">
      {days.map((d) => {
        const on = selected === d.key;
        return (
          <TouchableOpacity
            key={d.key}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${d.key}, dia ${d.num}${d.isToday ? ', hoje' : ''}`}
            onPress={() => onSelect(d.key)}
            style={[styles.day, on && styles.dayOn]}
          >
            <Text style={[styles.short, on && styles.onText]}>{d.short}</Text>
            <Text style={[styles.num, on && styles.onText]}>{d.num}</Text>
            <View style={[styles.dot, d.isToday && { backgroundColor: on ? colors.goldLight : colors.primary }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, minHeight: 68, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  short: { fontSize: 12, fontWeight: '600', color: colors.ink },
  num: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 24, fontWeight: '600', color: colors.ink },
  onText: { color: colors.surface },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
});
