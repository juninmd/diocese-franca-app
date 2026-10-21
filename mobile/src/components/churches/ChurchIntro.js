import React from 'react';
import { View, Linking, TouchableOpacity, StyleSheet } from 'react-native';
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
      {church.email ? <InfoLine icon="mail-outline">{church.email}</InfoLine> : null}
      {church.foundedAt ? <InfoLine icon="calendar-outline">Fundada em {formatDate(church.foundedAt)}</InfoLine> : null}
      {church.website ? (
        <TouchableOpacity activeOpacity={0.8} style={styles.link} onPress={() => Linking.openURL(church.website)}>
          <Ionicons name="globe-outline" size={18} color={colors.primary} />
          <Text variant="label" style={{ color: colors.primary }}>Página oficial da paróquia</Text>
        </TouchableOpacity>
      ) : null}
      {church.description ? (
        <View style={styles.about}>
          <Text variant="heading">Sobre</Text>
          <Text variant="body" style={{ color: colors.muted }}>{church.description}</Text>
        </View>
      ) : null}
    </View>
  );
}

// "1805-12-03" -> "03/12/1805"
const formatDate = (iso) => iso.split('-').reverse().join('/');

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
  link: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44 },
  about: { gap: 6, marginTop: 8 },
});
