import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChurches, getPriests, getMasses, getNews, getNearbyChurches } from '../services/api';
import { LocationService } from '../services/LocationService';
import { scheduleReminder } from '../services/ReminderService';
import { useToast } from '../context/ToastContext';
import { NetworkStatus } from '../components/NetworkStatus';
import { HomeHeader } from '../components/home/HomeHeader';
import { NearestChurchCard } from '../components/home/NearestChurchCard';
import { StatsRow } from '../components/home/StatsRow';
import { NewsCarousel } from '../components/home/NewsCarousel';
import { QuickActions } from '../components/home/QuickActions';
import { ContactCard } from '../components/home/ContactCard';
import { buildQuickActions, callDiocese, emailDiocese } from '../components/home/quickActionItems';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [stats, setStats] = useState({ churches: 0, priests: 0, masses: 0 });
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearest, setNearest] = useState({ church: null, loading: false, error: null });

  useEffect(() => {
    loadStats();
    fetchNews();
  }, []);

  const loadStats = async () => {
    try {
      const [churches, priests, masses] = await Promise.all([getChurches(), getPriests(), getMasses()]);
      const count = (list) => list.length;
      setStats({ churches: count(churches), priests: count(priests), masses: count(masses) });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const data = await getNews();
      setNews(data && data.success && data.data ? data.data : []);
    } catch (err) {
      console.error('Failed to load news', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const findNearestChurch = async () => {
    setNearest({ church: null, loading: true, error: null });
    const { granted, coords } = await LocationService.getCurrentPosition();
    if (!granted || !coords) {
      setNearest({ church: null, loading: false, error: 'Puxa, permita o acesso à localização para descobrir a igreja mais próxima de você.' });
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
    await Promise.all([loadStats(), fetchNews()]);
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const openNews = (item) => {
    Linking.openURL(item.link);
    toast.info('Abrindo a notícia...');
  };

  const remindNews = async (item) => {
    const ok = await scheduleReminder({ title: 'Lembrete de Leitura 📖', body: item.title, seconds: 10, data: { url: item.link } });
    if (ok) toast.success('Lembrete configurado para daqui a 10 segundos!');
    else toast.error('Permissão de notificação negada.');
  };

  const go = (tab) => () => navigation.navigate(tab);
  const openChurch = () => navigation.navigate('Churches', { screen: 'ChurchDetail', params: { churchId: nearest.church.id } });

  return (
    <View style={styles.container}>
      <NetworkStatus />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <HomeHeader onRefresh={onRefresh} />
        <NearestChurchCard church={nearest.church} loading={nearest.loading} error={nearest.error} onFind={findNearestChurch} onOpen={openChurch} />
        <StatsRow
          items={[
            { label: 'Paróquias', value: stats.churches, onPress: go('Churches') },
            { label: 'Padres', value: stats.priests, onPress: go('Priests') },
            { label: 'Missas/sem', value: stats.masses, onPress: go('Masses') },
          ]}
        />
        <NewsCarousel news={news} loading={loadingNews} onOpen={openNews} onRemind={remindNews} onRetry={fetchNews} />
        <QuickActions items={buildQuickActions({ navigation, toast })} />
        <ContactCard onCall={callDiocese} onEmail={emailDiocese} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 120, gap: 24 },
});
