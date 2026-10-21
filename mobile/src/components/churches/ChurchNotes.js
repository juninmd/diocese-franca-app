import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui';
import { colors } from '../../theme';

const Block = ({ title, lines }) =>
  lines && lines.length > 0 ? (
    <View style={styles.block}>
      <Text variant="heading">{title}</Text>
      {lines.map((line) => <Text key={line} variant="caption">{line}</Text>)}
    </View>
  ) : null;

// Horário da secretaria e missas que não seguem a grade semanal (ex.: "1ª sexta-feira do mês").
export function ChurchNotes({ church }) {
  return (
    <View style={styles.box}>
      <Block title="Outros horários de missa" lines={church.massNotes} />
      <Block title="Secretaria" lines={church.officeHours} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 16 },
  block: { gap: 4, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
});
