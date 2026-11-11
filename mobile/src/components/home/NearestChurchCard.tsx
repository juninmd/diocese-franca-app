import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button, ProgressRing } from '../ui';
import { colors, radius } from '../../theme';
import { formatNextMass, formatDistance } from '../../utils/massTime';
import type { NearbyChurch } from '../../types';

const WINDOW = 180; // o anel enche nas últimas 3h antes da missa

// Estado da busca pela igreja mais próxima (controlado pela Home).
export interface NearestState {
  church: NearbyChurch | null;
  loading: boolean;
  error: string | null;
}

function countdown(minutes: number) {
  if (minutes < 60) return { value: String(Math.max(minutes, 0)), unit: 'min' };
  if (minutes < 24 * 60) return { value: String(Math.round(minutes / 60)), unit: 'horas' };
  return { value: String(Math.round(minutes / 1440)), unit: 'dias' };
}

// Destaque "Agora": igreja mais próxima + contagem regressiva para a próxima missa.
interface NearestChurchCardProps extends NearestState {
  onFind: () => void;
  onOpen: () => void;
}

export function NearestChurchCard({ church, loading, error, onFind, onOpen }: NearestChurchCardProps) {
  const next = church?.nextMass;
  const left = next ? countdown(next.startsInMinutes) : null;
  return (
    <View style={styles.card}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.goldLight} />
          <Text style={styles.soft}>Localizando você...</Text>
        </View>
      ) : church ? (
        <>
          <View style={styles.top}>
            {next && left ? (
              <ProgressRing size={92} progress={1 - next.startsInMinutes / WINDOW} color={colors.goldLight} track={colors.heroLine}>
                <Text style={styles.big}>{left.value}</Text>
                <Text style={styles.unit}>{left.unit}</Text>
              </ProgressRing>
            ) : null}
            <View style={styles.info}>
              <Text variant="overline" style={styles.overline}>Igreja mais próxima</Text>
              <Text variant="heading" style={styles.name} numberOfLines={3}>{church.name}</Text>
              <Text style={styles.soft}>{formatDistance(church.distanceKm)} de você</Text>
            </View>
          </View>
          {next ? <Text variant="label" style={styles.when}>Próxima missa: {formatNextMass(next)}</Text> : null}
          <Button label="Ver igreja" icon="chevron-forward" tone="gold" onPress={onOpen} />
        </>
      ) : (
        <>
          <Text variant="overline" style={styles.overline}>Igreja mais próxima</Text>
          <Text variant="title" style={styles.name}>Encontre a missa mais perto de você</Text>
          {error ? <Text style={styles.soft}>{error}</Text> : null}
          <Button
            label={error ? 'Tentar novamente' : 'Encontrar a igreja mais próxima'}
            icon="locate"
            tone="gold"
            onPress={onFind}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg + 2, backgroundColor: colors.heroSurface, borderWidth: 1, borderColor: colors.heroLine, padding: 18, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  overline: { color: colors.goldLight },
  name: { color: colors.cream },
  soft: { fontSize: 14, color: colors.creamMuted },
  big: { fontSize: 24, fontWeight: '800', color: colors.cream, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 11, fontWeight: '600', color: colors.creamMuted },
  when: { color: colors.cream },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
