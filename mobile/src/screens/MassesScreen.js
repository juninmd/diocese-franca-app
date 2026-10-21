import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMasses } from '../services/api';
import { scheduleReminder } from '../services/ReminderService';
import { useToast } from '../context/ToastContext';
import { NetworkStatus } from '../components/NetworkStatus';
import { ListSkeleton } from '../components/Skeleton';
import { Text, EmptyState } from '../components/ui';
import { DayStrip } from '../components/masses/DayStrip';
import { MassRow } from '../components/masses/MassRow';
import { TypeFilter } from '../components/masses/TypeFilter';
import { DAY_NAMES, weekDays, dayTitle, groupByDay, findNextMassId } from '../components/masses/massUtils';
import { colors, space } from '../theme';

const ERROR_MSG = 'Puxa, não conseguimos carregar os horários das missas agora. Verifique sua conexão e tente novamente!';
const EMPTY_MSG = 'Puxa, não encontramos missas para esses filtros. Vamos tentar limpar os filtros e buscar novamente?';

export default function MassesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const today = DAY_NAMES[new Date().getDay()];
  const [masses, setMasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(route?.params?.day || today);
  const [massType, setMassType] = useState('all');
  const [reminders, setReminders] = useState({});

  const loadMasses = useCallback(async () => {
    try {
      setMasses(await getMasses());
      setError(null);
    } catch (err) {
      setError(ERROR_MSG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMasses(); }, [loadMasses]);
  useEffect(() => { if (route?.params?.day) setSelectedDay(route.params.day); }, [route?.params?.day]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMasses();
    setRefreshing(false);
    toast.success('Horários atualizados!');
  }, [loadMasses, toast]);

  const remind = async (item) => {
    try {
      const ok = await scheduleReminder({
        title: 'Lembrete de Missa',
        body: `Missa às ${item.time}${item.church ? ' na ' + item.church.name : ''}`,
        seconds: 5,
        data: { massId: item.id },
      });
      if (!ok) return toast.error('Permissão de notificação negada.');
      setReminders((r) => ({ ...r, [item.id]: true }));
      toast.success('Lembrete configurado para daqui a 5 segundos!');
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível agendar o lembrete.');
    }
  };

  const clearFilters = () => {
    setSelectedDay('all');
    setMassType('all');
    toast.success('Filtros limpos! Veja todos os horários.');
  };

  const sections = useMemo(() => groupByDay(masses.filter((m) =>
    (selectedDay === 'all' || m.dayOfWeek === selectedDay) && (massType === 'all' || m.type === massType))), [masses, selectedDay, massType]);
  const types = useMemo(() => [...new Set(masses.map((m) => m.type))], [masses]);
  const nextId = useMemo(() => findNextMassId(masses), [masses]);
  const hasFilters = selectedDay !== 'all' || massType !== 'all';
  const openChurch = (churchId) => navigation.navigate('Churches', { screen: 'ChurchDetail', params: { churchId } });

  const renderBody = () => {
    if (loading && !refreshing) return <ListSkeleton count={5} type="mass" />;
    if (error && masses.length === 0) {
      return <EmptyState icon="alert-circle-outline" message={error} actionLabel="Tentar Novamente" onAction={() => { setLoading(true); loadMasses(); }} />;
    }
    if (sections.length === 0) {
      return (
        <View style={styles.list}>
          <Text variant="heading">Puxa, não encontramos missas.</Text>
          <EmptyState icon="calendar-outline" message={EMPTY_MSG} actionLabel={hasFilters ? 'Limpar filtros' : undefined} onAction={clearFilters} />
        </View>
      );
    }
    return sections.map(({ day, data }) => (
      <View key={day} style={styles.list}>
        <View style={styles.sectionHead}>
          <Text variant="title">{dayTitle(day)}</Text>
          <Text variant="caption">{data.length} {data.length === 1 ? 'missa' : 'missas'}</Text>
        </View>
        {data.map((item) => (
          <MassRow key={item.id} item={item} isNext={item.id === nextId} reminderSet={!!reminders[item.id]} onOpenChurch={openChurch} onRemind={remind} />
        ))}
      </View>
    ));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.xxl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
    >
      <NetworkStatus />
      <View style={styles.titleBox}>
        <Text variant="display">Horários de missa</Text>
        <Text variant="body" style={{ color: colors.muted }}>
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · toda a diocese
        </Text>
      </View>
      <DayStrip days={weekDays()} selected={selectedDay} onSelect={setSelectedDay} />
      <TypeFilter
        types={types}
        allDays={selectedDay === 'all'}
        onToggleAllDays={() => setSelectedDay(selectedDay === 'all' ? today : 'all')}
        selectedType={massType}
        onSelectType={setMassType}
      />
      {renderBody()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.xl, paddingBottom: 110, gap: 18 },
  titleBox: { gap: space.xs },
  list: { gap: 10 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
