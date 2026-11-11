import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMasses } from '../hooks/useData';
import { scheduleReminder } from '../services/ReminderService';
import { nextReminder } from '../utils/reminderTime';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { Text, EmptyState, FadeIn, IconButton } from '../components/ui';
import { NowLine } from '../components/masses/NowLine';
import { useSearch } from '../context/SearchContext';
import { DayStrip } from '../components/masses/DayStrip';
import { MassRow } from '../components/masses/MassRow';
import { TypeFilter } from '../components/masses/TypeFilter';
import { DAY_NAMES, weekDays, dayTitle, groupByDay, findNextMassId } from '../components/masses/massUtils';
import { colors, space } from '../theme';
import type { RootTabScreenProps } from '../navigation/types';
import type { MassWithChurch } from '../types';

const EMPTY: MassWithChurch[] = [];
const ERROR_MSG = 'Puxa, não conseguimos carregar os horários das missas agora. Verifique sua conexão e tente novamente!';
const EMPTY_MSG = 'Puxa, não encontramos missas para esses filtros. Vamos tentar limpar os filtros e buscar novamente?';

export default function MassesScreen({ navigation, route }: RootTabScreenProps<'Masses'>) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const search = useSearch();
  const today = DAY_NAMES[new Date().getDay()];
  const resource = useMasses();
  const masses = resource.data || EMPTY;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(route?.params?.day || today);
  const [massType, setMassType] = useState('all');
  const [reminders, setReminders] = useState<Record<number, boolean>>({});
  const error = resource.error && masses.length === 0 ? ERROR_MSG : null;

  useEffect(() => { const day = route?.params?.day; if (day) setSelectedDay(day); }, [route?.params?.day]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await resource.reload();
    setRefreshing(false);
    if (result && !result.stale) toast.success('Horários atualizados!');
    else toast.warning('Sem conexão: mostrando os horários salvos.');
  }, [resource.reload, toast]);

  const remind = async (item: MassWithChurch) => {
    try {
      // Avisa 30 min antes da próxima ocorrência desta missa (relógio de Franca).
      const when = nextReminder([item], 30);
      if (!when) return;
      const ok = await scheduleReminder({
        title: 'Lembrete de Missa',
        body: `Missa às ${item.time}${item.chapel ? ' na ' + item.chapel.name : item.church ? ' na ' + item.church.name : ''}`,
        seconds: when.seconds,
        data: { massId: item.id },
      });
      if (!ok) return void toast.error('Puxa, sem permissão de notificação não conseguimos lembrar você.');
      setReminders((r) => ({ ...r, [item.id]: true }));
      toast.success(`Vamos avisar ${when.label} (30 min antes da missa).`);
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
  const nowHHMM = new Date().toTimeString().slice(0, 5);
  const hasFilters = selectedDay !== 'all' || massType !== 'all';
  const openChurch = (churchId: number) => navigation.navigate('Churches', { screen: 'ChurchDetail', params: { churchId } });

  const renderBody = () => {
    if (resource.loading && !refreshing) return <ListSkeleton count={5} type="mass" />;
    if (error) {
      return <EmptyState icon="alert-circle-outline" message={error} actionLabel="Tentar Novamente" onAction={() => resource.reload()} />;
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
        {data.map((item, i) => (
          <FadeIn key={item.id} index={i} style={styles.item}>
            {item.id === nextId ? <NowLine /> : null}
            <MassRow item={item} isNext={item.id === nextId} past={day === today && item.time < nowHHMM} reminderSet={!!reminders[item.id]} onOpenChurch={openChurch} onRemind={remind} />
          </FadeIn>
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
      <View style={styles.titleRow}>
        <View style={styles.titleBox}>
          <Text variant="overline">Toda a diocese</Text>
          <Text variant="display">Horários de missa</Text>
          <Text variant="body" style={{ color: colors.muted }}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · toda a diocese
          </Text>
        </View>
        <IconButton icon="search" label="Busca universal" onPress={search.open} />
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
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titleBox: { flex: 1, gap: space.xs },
  item: { gap: 10 },
  list: { gap: 10 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
