import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, ArchArt, Button } from '../ui';
import { colors, radius } from '../../theme';
import { formatNextMass, formatDistance } from '../../utils/massTime';

// Destaque da Home: igreja mais próxima + próxima missa.
export function NearestChurchCard({ church, loading, error, onFind, onOpen }) {
  return (
    <View style={styles.card}>
      <View style={styles.art}><ArchArt width={96} color={colors.goldLight} stroke={1.2} /></View>
      <Text variant="overline" style={styles.overline}>Igreja mais próxima</Text>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.goldLight} />
          <Text style={styles.soft}>Localizando você...</Text>
        </View>
      ) : church ? (
        <>
          <Text variant="title" style={styles.name} numberOfLines={2}>{church.name}</Text>
          <Text style={styles.soft}>{formatDistance(church.distanceKm)} de você</Text>
          {church.nextMass ? (
            <View style={styles.timePill}>
              <Text variant="label" style={styles.timeText}>Próxima missa: {formatNextMass(church.nextMass)}</Text>
            </View>
          ) : null}
          <Button label="Ver igreja" icon="chevron-forward" tone="gold" onPress={onOpen} style={styles.btn} />
        </>
      ) : (
        <>
          <Text variant="title" style={styles.name}>Encontre a missa mais perto de você</Text>
          {error ? <Text style={styles.soft}>{error}</Text> : null}
          <Button
            label={error ? 'Tentar novamente' : 'Encontrar a igreja mais próxima'}
            icon="locate"
            tone="gold"
            onPress={onFind}
            style={styles.btn}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: radius.xl, backgroundColor: colors.primaryDark, padding: 22, gap: 10 },
  art: { position: 'absolute', right: 8, bottom: -6, opacity: 0.35 },
  overline: { color: colors.goldLight },
  name: { color: colors.cream, maxWidth: '78%' },
  soft: { fontSize: 14, color: colors.creamMuted },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timePill: { alignSelf: 'flex-start', backgroundColor: colors.cream, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  timeText: { color: colors.primaryDark },
  btn: { alignSelf: 'flex-start', marginTop: 4 },
});
