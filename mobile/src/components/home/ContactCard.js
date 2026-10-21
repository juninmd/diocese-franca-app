import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors, radius } from '../../theme';

const Row = ({ icon, label, value, onPress }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={onPress} disabled={!onPress}>
    <View style={styles.circle}><Ionicons name={icon} size={20} color={colors.primary} /></View>
    <View style={styles.texts}>
      <Text variant="caption">{label}</Text>
      <Text variant="label">{value}</Text>
    </View>
  </TouchableOpacity>
);

export function ContactCard({ onCall, onEmail }) {
  return (
    <View style={styles.card}>
      <Text variant="title">Contato da Diocese</Text>
      <Row icon="call-outline" label="Telefone" value="(16) 3711-1400" onPress={onCall} />
      <Row icon="mail-outline" label="Email" value="contato@diocesefranca.org.br" onPress={onEmail} />
      <Row icon="location-outline" label="Endereço" value="Praça Nossa Senhora da Conceição, 85 - Centro" />
      <Text variant="caption" style={styles.footer}>Franca - SP, 14400-670 · Paróquia em Cristo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 20, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 48 },
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint },
  texts: { flex: 1, gap: 2 },
  footer: { textAlign: 'center' },
});
