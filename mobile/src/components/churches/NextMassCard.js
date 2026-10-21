import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '../ui';
import { colors, radius, fonts } from '../../theme';
import { formatNextMass } from '../../utils/massTime';

// Cartão vinho com a próxima missa e o botão dourado "Lembrar-me".
export function NextMassCard({ nextMass, onRemind }) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text variant="overline" style={{ color: colors.goldLight }}>Próxima missa</Text>
        <Text style={styles.when}>{formatNextMass(nextMass)}</Text>
        {nextMass.type ? <Text variant="caption" style={{ color: colors.creamMuted }}>{nextMass.type}</Text> : null}
      </View>
      <Button label="Lembrar-me" icon="notifications-outline" tone="gold" onPress={onRemind} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.primaryDark },
  info: { flexGrow: 1, flexShrink: 1, flexBasis: 160, gap: 2 },
  when: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 27, fontWeight: '500', color: colors.cream },
});
