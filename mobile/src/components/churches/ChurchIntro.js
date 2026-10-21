import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors } from '../../theme';

// Título serifado, endereço, telefone e descrição ("Sobre") da igreja.
export function ChurchIntro({ church }) {
  return (
    <View style={styles.box}>
      <Text variant="title" accessibilityRole="header" style={styles.title}>{church.name}</Text>
      <InfoLine icon="location-outline">
        {church.address}{'\n'}{church.city} - {church.state}, CEP: {church.zipCode}
      </InfoLine>
      <InfoLine icon="call-outline">{church.phone}</InfoLine>
      {church.description ? (
        <View style={styles.about}>
          <Text variant="heading">Sobre</Text>
          <Text variant="body" style={{ color: colors.muted }}>{church.description}</Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoLine({ icon, children }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={18} color={colors.muted} style={{ marginTop: 1 }} />
      <Text variant="caption" style={styles.lineText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 8 },
  title: { fontSize: 29, lineHeight: 32 },
  line: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  lineText: { flex: 1, fontSize: 14, lineHeight: 19 },
  about: { gap: 6, marginTop: 8 },
});
