import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors } from '../../theme';

// Três atalhos: mapa, telefone e lembrete de visita.
export function ActionTiles({ phone, onMap, onCall, onVisit }) {
  return (
    <View style={styles.row}>
      <Tile icon="navigate-outline" label="Como chegar" onPress={onMap} />
      {phone ? <Tile icon="call-outline" label="Ligar" hint={phone} onPress={onCall} /> : null}
      <Tile icon="calendar-outline" label="Agendar Visita" hint="Receber um lembrete" onPress={onVisit} />
    </View>
  );
}

function Tile({ icon, label, hint, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}: ${hint}` : label}
      onPress={onPress}
      style={styles.tile}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text variant="caption" style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, minHeight: 76, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 4, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  label: { color: colors.ink, fontWeight: '600', textAlign: 'center' },
});
