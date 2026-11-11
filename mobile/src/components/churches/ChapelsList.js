import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors } from '../../theme';

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// [{ dayOfWeek, time }] -> ["Domingo: 10:30", "Quinta-feira: 19:00"] (ordem da semana)
export function chapelScheduleLines(masses = []) {
  return DAYS.map((day) => {
    const times = masses.filter((m) => m.dayOfWeek === day).map((m) => m.time).sort();
    return times.length ? `${day}: ${times.join(', ')}` : null;
  }).filter(Boolean);
}

export function ChapelsList({ chapels }) {
  if (!chapels || chapels.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.header}>Capelas e Comunidades</Text>
      {chapels.map((chapel, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
            <Text variant="heading" style={styles.title}>{chapel.name}</Text>
          </View>
          {chapel.address ? (
            <Text variant="caption" style={styles.address}>{chapel.address}</Text>
          ) : null}
          {chapelScheduleLines(chapel.masses).map((line) => (
            <View key={line} style={styles.massRow}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text variant="caption" style={styles.mass}>{line}</Text>
            </View>
          ))}
          {(chapel.massNotes || []).map((note) => (
            <Text key={note} variant="caption" style={styles.note}>{note}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { fontSize: 18 },
  card: {
    gap: 6,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, color: colors.text, flex: 1 },
  address: { fontSize: 13, color: colors.muted, marginLeft: 26 },
  massRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 26 },
  mass: { fontSize: 13, color: colors.ink, fontVariant: ['tabular-nums'] },
  note: { fontSize: 12, color: colors.muted, fontStyle: 'italic', marginLeft: 26 },
});
