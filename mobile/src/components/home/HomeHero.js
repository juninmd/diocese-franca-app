import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text, IconButton, FadeIn, Pulse } from '../ui';
import { NearestChurchCard } from './NearestChurchCard';
import { colors, season } from '../../theme';

const formatToday = () =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

// Topo "noite" da Home: saudação, tempo litúrgico, busca/atualizar e o destaque "Agora".
export function HomeHero({ topInset, onRefresh, onSearch, nearest, onFind, onOpen }) {
  return (
    <View style={[styles.hero, { paddingTop: topInset + 20 }]}>
      <Svg width={280} height={280} viewBox="0 0 260 260" style={styles.art} pointerEvents="none">
        <Path d="M30 260V120a100 100 0 0 1 200 0v140" fill="none" stroke={colors.primary} strokeWidth={22} opacity={0.5} />
        <Path d="M75 260V130a55 55 0 0 1 110 0v130" fill="none" stroke={colors.goldLight} strokeWidth={8} opacity={0.35} />
      </Svg>
      <FadeIn style={styles.row}>
        <View style={styles.texts}>
          <Text variant="overline" style={styles.date}>{formatToday()}</Text>
          <Text variant="display" style={styles.cream}>A paz esteja{'\n'}com você</Text>
          <Text variant="caption" style={styles.soft}>Diocese de Franca · Aplicativo Oficial</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="search" label="Busca universal" onDark onPress={onSearch} />
          <IconButton icon="refresh" label="Atualizar dados" onDark onPress={onRefresh} />
        </View>
      </FadeIn>
      <FadeIn index={1} style={styles.season}>
        <Pulse color={season.dark} size={10} />
        <Text style={styles.seasonText}>{season.name} · a cor do app acompanha a liturgia</Text>
      </FadeIn>
      <FadeIn index={2}>
        <NearestChurchCard church={nearest.church} loading={nearest.loading} error={nearest.error} onFind={onFind} onOpen={onOpen} />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.hero, paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, gap: 18, overflow: 'hidden' },
  art: { position: 'absolute', right: -80, top: -50 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  texts: { flex: 1, gap: 6 },
  actions: { gap: 8 },
  date: { color: colors.creamMuted },
  cream: { color: colors.cream },
  soft: { color: colors.creamMuted },
  season: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seasonText: { color: colors.cream, fontSize: 13.5, fontWeight: '600', flex: 1 },
});
