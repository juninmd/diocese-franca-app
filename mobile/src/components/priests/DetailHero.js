import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ArchArt, FadeIn } from '../ui';
import { colors, radius } from '../../theme';
import { PriestAvatar } from './PriestAvatar';

// Cabeçalho vinho do detalhe: avatar dourado, função e nome em serifa.
export function DetailHero({ priest }) {
  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.art}>
        <ArchArt width={90} color={colors.goldLight} />
      </View>
      <FadeIn distance={0} style={styles.ring}><PriestAvatar name={priest.name} image={priest.image} size={96} bg={colors.primary} color={colors.onPrimary} /></FadeIn>
      <Text variant="overline" style={{ color: colors.goldLight }}>{priest.title}</Text>
      <Text variant="display" style={styles.name}>{priest.name}</Text>
      {(priest.birthDate || priest.ordinationDate) && (
        <View style={styles.datesRow}>
          {priest.birthDate ? (
            <Text variant="caption" style={styles.dateBadge}>Nascimento: {priest.birthDate}</Text>
          ) : null}
          {priest.ordinationDate ? (
            <Text variant="caption" style={styles.dateBadge}>Ordenação: {priest.ordinationDate}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: radius.xl, backgroundColor: colors.primaryDark, padding: 24, gap: 10 },
  ring: { alignSelf: 'flex-start', padding: 3, borderRadius: 60, borderWidth: 3, borderColor: colors.goldLight },
  art: { position: 'absolute', right: -4, bottom: -8, opacity: 0.3 },
  name: { color: colors.cream, fontSize: 30, lineHeight: 34 },
  datesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
  },
});
