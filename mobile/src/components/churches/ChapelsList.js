import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors } from '../../theme';

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
});
