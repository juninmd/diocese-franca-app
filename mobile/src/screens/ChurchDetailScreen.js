import React from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, EmptyState } from '../components/ui';
import { DetailHero } from '../components/churches/DetailHero';
import { ChurchIntro } from '../components/churches/ChurchIntro';
import { NextMassCard } from '../components/churches/NextMassCard';
import { ActionTiles } from '../components/churches/ActionTiles';
import { MassSchedule } from '../components/churches/MassSchedule';
import { ClergyCard } from '../components/churches/ClergyCard';
import { useChurchDetail } from '../components/churches/useChurchDetail';
import { useChurchActions } from '../components/churches/useChurchActions';
import { colors } from '../theme';

export default function ChurchDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { church, loading, error, isFavorite, reload, toggleFavorite } = useChurchDetail(route.params.churchId);
  const actions = useChurchActions(church);

  let body;
  if (loading) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="caption">Carregando...</Text>
      </View>
    );
  } else if (error || !church) {
    body = (
      <EmptyState
        icon="alert-circle-outline"
        message={error || 'Puxa, não encontramos a igreja'}
        actionLabel="Tentar Novamente"
        onAction={reload}
      />
    );
  } else {
    body = (
      <>
        <ChurchIntro church={church} />
        {church.nextMass ? <NextMassCard nextMass={church.nextMass} onRemind={actions.remindMass} /> : null}
        <ActionTiles
          phone={church.phone}
          onMap={actions.openMap}
          onCall={() => actions.call(church.phone)}
          onVisit={actions.remindVisit}
        />
        {church.masses?.length > 0 ? <MassSchedule masses={church.masses} nextMass={church.nextMass} /> : null}
        {church.priest ? <ClergyCard priest={church.priest} onEmail={actions.email} onCall={actions.call} /> : null}
      </>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <DetailHero
        image={church && church.image}
        topInset={insets.top}
        onBack={() => navigation.goBack()}
        isFavorite={isFavorite}
        onToggleFavorite={church && !loading ? toggleFavorite : undefined}
      />
      <View style={styles.sheet}>{body}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sheet: { marginTop: -34, minHeight: 400, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: colors.bg, paddingTop: 24, paddingHorizontal: 20, gap: 20 },
  center: { alignItems: 'center', gap: 12, padding: 24 },
});
