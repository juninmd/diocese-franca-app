import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ArchArt } from '../ui';
import { colors, radius } from '../../theme';
import { PriestAvatar } from './PriestAvatar';

// Cabeçalho vinho do detalhe: avatar dourado, função e nome em serifa.
export function DetailHero({ priest }) {
  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.art}>
        <ArchArt width={90} color={colors.goldLight} />
      </View>
      <PriestAvatar name={priest.name} image={priest.image} size={88} bg={colors.goldLight} color={colors.onGold} />
      <Text variant="overline" style={{ color: colors.goldLight }}>{priest.title}</Text>
      <Text variant="display" style={styles.name}>{priest.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: radius.xl, backgroundColor: colors.primaryDark, padding: 24, gap: 10 },
  art: { position: 'absolute', right: -4, bottom: -8, opacity: 0.3 },
  name: { color: colors.cream, fontSize: 30, lineHeight: 34 },
});
