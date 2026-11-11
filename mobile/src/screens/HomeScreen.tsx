import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNearbyChurches } from '../services/api';
import { useChurches, usePriests, useMasses, useNews } from '../hooks/useData';
import { LocationService, LOCATION_MESSAGES } from '../services/LocationService';
import { scheduleReminder } from '../services/ReminderService';
import { everyDay, nextReminder } from '../utils/reminderTime';
import { useToast } from '../context/ToastContext';
import { HomeHero } from '../components/home/HomeHero';
import { FadeIn } from '../components/ui';
import { useSearch } from '../context/SearchContext';
import { StatsRow } from '../components/home/StatsRow';
import { NewsCarousel } from '../components/home/NewsCarousel';
import { QuickActions } from '../components/home/QuickActions';
import { ContactCard } from '../components/home/ContactCard';
import { buildQuickActions, callDiocese, emailDiocese } from '../components/home/quickActionItems';
import { openExternalUrl } from '../utils/openExternalUrl';
import { colors } from '../theme';
import type { NearestState } from '../components/home/NearestChurchCard';
import type { RootTabScreenProps } from '../navigation/types';
import type { NewsItem } from '../types';

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const search = useSearch();
  const churches = useChurches();
  const priests = usePriests();
  const masses = useMasses();
  const news = useNews();
  const [refreshing, setRefreshing] = useState(false);
  const [nearest, setNearest] = useState<NearestState>({ church: null, loading: false, error: null });
  const count = (resource: { data: unknown[] | null }) => (resource.data ? resource.data.length : 0);

  const findNearestChurch = async () => {
    setNearest({ church: null, loading: true, error: null });
    const { granted, coords, reason } = await LocationService.getCurrentPosition();
    if (!granted || !coords) {
      setNearest({ church: null, loading: false, error: (reason && LOCATION_MESSAGES[reason]) || LOCATION_MESSAGES.denied });
      return;
    }
    try {
      const data = await getNearbyChurches(coords.latitude, coords.longitude);
      setNearest({ church: data && data.success ? data.nearest : null, loading: false, error: null });
    } catch (err) {
      setNearest({ church: null, loading: false, error: 'Puxa, não conseguimos encontrar a igreja mais próxima agora. Tente novamente.' });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const results = await Promise.all([churches, priests, masses, news].map((r) => r.reload()));
    setRefreshing(false);
    if (results.every((r) => r && !r.stale)) toast.success('Dados atualizados!');
    else toast.warning('Sem conexão: mostrando os dados salvos.');
  };

  const openNews = async (item: NewsItem) => {
    const opened = await openExternalUrl(item.link, toast);
    if (opened) {
      toast.info('Abrindo a notícia...');
    }
  };

  const remindNews = async (item: NewsItem) => {
    // Leitura com calma, à noite (20h no relógio de Franca).
    const when = nextReminder(everyDay('20:00'))!;
    const ok = await scheduleReminder({ title: 'Lembrete de Leitura 📖', body: item.title, seconds: when.seconds, data: { url: item.link } });
    if (ok) toast.success(`Lembrete de leitura configurado para ${when.label}!`);
    else toast.error('Puxa, sem permissão de notificação não conseguimos lembrar você.');
  };

  const go = (tab: 'Churches' | 'Priests' | 'Masses') => () => navigation.navigate(tab);
  const openChurch = () => {
    // O botão "Ver igreja" só aparece com uma igreja encontrada.
    if (nearest.church) navigation.navigate('Churches', { screen: 'ChurchDetail', params: { churchId: nearest.church.id } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <HomeHero topInset={insets.top} onRefresh={onRefresh} onSearch={search.open} nearest={nearest} onFind={findNearestChurch} onOpen={openChurch} />
        <View style={styles.content}>
        <FadeIn index={3}><StatsRow
          items={[
            { label: 'Paróquias', value: count(churches), onPress: go('Churches') },
            { label: 'Padres', value: count(priests), onPress: go('Priests') },
            { label: 'Missas/semana', value: count(masses), onPress: go('Masses') },
          ]}
        /></FadeIn>
        <FadeIn index={4}><QuickActions items={buildQuickActions({ navigation, toast })} /></FadeIn>
        <FadeIn index={5}><NewsCarousel news={news.data || []} loading={news.loading} onOpen={openNews} onRemind={remindNews} error={!!news.error} onRetry={() => news.reload()} /></FadeIn>
        <FadeIn index={6}><ContactCard onCall={() => callDiocese(toast)} onEmail={() => emailDiocese(toast)} /></FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 130 },
  content: { paddingHorizontal: 20, paddingTop: 24, gap: 28 },
});
