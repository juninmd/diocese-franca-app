import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '../ui';
import { colors, fonts } from '../../theme';
import type { Priest } from '../../types';

// Iniciais ignorando tratamentos abreviados ("Pe.", "Mons.").
const initialsOf = (name: string) =>
  name.split(' ').filter((w) => w && !w.endsWith('.')).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Pároco da igreja com contatos de e-mail e telefone e, abaixo, o restante da equipe.
interface ClergyCardProps {
  priest: Priest;
  team?: Priest[];
  onEmail: (email: string) => void;
  onCall: (phone: string) => void;
}

export function ClergyCard({ priest, team = [], onEmail, onCall }: ClergyCardProps) {
  const { email, phone } = priest;
  return (
    <View style={styles.section}>
      <Text variant="title" accessibilityRole="header" style={styles.heading}>Pároco</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initialsOf(priest.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text variant="label" style={{ fontSize: 16 }}>{priest.name}</Text>
          <Text variant="caption">{priest.title}</Text>
          {priest.bio ? <Text variant="caption" style={{ marginTop: 6 }}>{priest.bio}</Text> : null}
        </View>
      </View>
      {team.map((member) => (
        <Text key={member.id} variant="caption">{member.title}: <Text variant="label" style={{ fontSize: 14 }}>{member.name}</Text></Text>
      ))}
      <View style={styles.contacts}>
        {email ? <Button label="Email" icon="mail-outline" onPress={() => onEmail(email)} style={styles.contact} /> : null}
        {phone ? <Button label="Ligar" icon="call-outline" tone="outline" onPress={() => onCall(phone)} style={styles.contact} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { fontSize: 23, lineHeight: 27 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.serif, fontSize: 19, fontWeight: '600', color: colors.primary },
  info: { flex: 1, gap: 2 },
  contacts: { flexDirection: 'row', gap: 10 },
  contact: { flex: 1 },
});
