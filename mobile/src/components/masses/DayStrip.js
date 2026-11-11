import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Text } from '../ui';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { colors, fonts } from '../../theme';

function Day({ d, on, onSelect }) {
  const reduce = useReduceMotion();
  const lift = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) lift.setValue(on ? 1 : 0);
    else Animated.spring(lift, { toValue: on ? 1 : 0, speed: 16, bounciness: 10, useNativeDriver: false }).start();
  }, [on, reduce]);
  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  return (
    <Animated.View style={[styles.cell, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        accessibilityLabel={`${d.key}, dia ${d.num}${d.isToday ? ', hoje' : ''}`}
        onPress={() => onSelect(d.key)}
        style={[styles.day, on && styles.dayOn]}
      >
        <Text style={[styles.short, on && styles.onText]}>{d.short}</Text>
        <Text style={[styles.num, on && styles.onText]}>{d.num}</Text>
        <View style={[styles.dot, d.isToday && { backgroundColor: on ? colors.onPrimary : colors.primary }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Faixa com os 7 dias da semana; o selecionado "sobe" e o dia atual leva um ponto.
export function DayStrip({ days, selected, onSelect }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Dia da semana">
      {days.map((d) => <Day key={d.key} d={d} on={selected === d.key} onSelect={onSelect} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, paddingTop: 6 },
  cell: { flex: 1 },
  day: { minHeight: 68, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  short: { fontSize: 12, fontWeight: '600', color: colors.ink },
  num: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 24, fontWeight: '600', color: colors.ink },
  onText: { color: colors.onPrimary },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
});
