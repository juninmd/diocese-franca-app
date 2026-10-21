import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui';
import { colors, fonts } from '../../theme';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Horários de missa: seletor de dia da semana + horários como chips serifados.
export function MassSchedule({ masses, nextMass }) {
  const nextIndex = DAYS.indexOf(nextMass?.dayOfWeek);
  const [day, setDay] = useState(nextIndex >= 0 ? nextIndex : new Date().getDay());
  const ofDay = masses.filter((m) => m.dayOfWeek === DAYS[day]).sort((a, b) => a.time.localeCompare(b.time));
  const types = [...new Set(ofDay.map((m) => m.type).filter(Boolean))].join(' · ');

  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header" style={styles.heading}>Horários de Missa</Text>
      <Text variant="caption">{masses.length} missas cadastradas</Text>
      <View style={styles.segment} accessibilityRole="tablist">
        {SHORT.map((label, i) => (
          <TouchableOpacity
            key={label}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={DAYS[i]}
            accessibilityState={{ selected: i === day }}
            onPress={() => setDay(i)}
            style={[styles.day, i === day && styles.dayActive]}
          >
            <Text variant="label" style={[styles.dayText, i === day && { color: colors.surface }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {ofDay.length === 0 ? (
        <View style={styles.none}>
          <Text variant="body" style={{ color: colors.muted }}>Puxa, não há missas neste dia. Veja outro dia da semana!</Text>
        </View>
      ) : (
        <>
          <View style={styles.times}>
            {ofDay.map((m) => (
              <View key={m.id} style={styles.time}>
                <Text style={styles.timeText}>{m.time}</Text>
              </View>
            ))}
          </View>
          {types ? <Text variant="caption">{types}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { fontSize: 23, lineHeight: 27 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 18, backgroundColor: colors.sand },
  day: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayActive: { backgroundColor: colors.primary },
  dayText: { fontSize: 13 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  timeText: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '500', color: colors.ink },
  none: { padding: 20, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CDBFA8' },
});
