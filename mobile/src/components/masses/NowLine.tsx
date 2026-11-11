import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Pulse } from '../ui';
import { colors } from '../../theme';

// Marcador "Agora" na linha do tempo das missas de hoje.
export function NowLine() {
  const now = new Date().toTimeString().slice(0, 5);
  return (
    <View style={styles.row} accessibilityLabel={`Agora, ${now}`}>
      <Pulse color={colors.now} size={12} />
      <Text style={styles.text}>AGORA · {now}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.now },
  line: { flex: 1, height: 2, backgroundColor: colors.now, opacity: 0.4 },
});
