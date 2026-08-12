import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getMasses } from '../services/api';
import { useToast } from '../context/ToastContext';
import { NetworkStatus } from '../components/NetworkStatus';
import { ListSkeleton } from '../components/Skeleton';

const DAYS_OF_WEEK = [
  { key: 'all', label: 'Todos', short: 'All' },
  { key: 'Domingo', label: 'Domingo', short: 'Dom' },
  { key: 'Segunda-feira', label: 'Segunda', short: 'Seg' },
  { key: 'Terça-feira', label: 'Terça', short: 'Ter' },
  { key: 'Quarta-feira', label: 'Quarta', short: 'Qua' },
  { key: 'Quinta-feira', label: 'Quinta', short: 'Qui' },
  { key: 'Sexta-feira', label: 'Sexta', short: 'Sex' },
  { key: 'Sábado', label: 'Sábado', short: 'Sáb' },
];

export default function MassesScreen() {
  const [masses, setMasses] = useState([]);
  const [filteredMasses, setFilteredMasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState('all');
  const [massType, setMassType] = useState('all');
  const toast = useToast();

  useEffect(() => {
    loadMasses();
  }, []);

  useEffect(() => {
    filterMasses();
  }, [selectedDay, massType, masses]);

  const loadMasses = async () => {
    try {
      setLoading(true);
      const data = await getMasses();
      setMasses(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar horários de missa. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMasses();
    setRefreshing(false);
    toast.success('Horários atualizados!');
  }, []);

  const filterMasses = () => {
    let filtered = masses;

    if (selectedDay !== 'all') {
      filtered = filtered.filter((mass) => mass.dayOfWeek === selectedDay);
    }

    if (massType !== 'all') {
      filtered = filtered.filter((mass) => mass.type === massType);
    }

    const grouped = groupByDay(filtered);
    setFilteredMasses(grouped);
  };

  const groupByDay = (massesList) => {
    const dayOrder = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const grouped = massesList.reduce((acc, mass) => {
      if (!acc[mass.dayOfWeek]) {
        acc[mass.dayOfWeek] = [];
      }
      acc[mass.dayOfWeek].push(mass);
      return acc;
    }, {});

    return dayOrder
      .filter(day => grouped[day])
      .map(day => ({
        day,
        data: grouped[day].sort((a, b) => a.time.localeCompare(b.time)),
      }));
  };

  const uniqueTypes = [...new Set(masses.map((m) => m.type))];

  const clearFilters = () => {
    setSelectedDay('all');
    setMassType('all');
  };

  const hasActiveFilters = selectedDay !== 'all' || massType !== 'all';

  const renderMassItem = ({ item }) => (
    <View style={styles.massCard}>
      <View style={styles.massTimeContainer}>
        <Text style={styles.massTime}>{item.time}</Text>
      </View>
      <View style={styles.massInfo}>
        <View style={styles.typeBadge}>
          <Ionicons name={item.type === 'Missa Dominical' ? 'sunny' : 'moon'} size={14} color={item.type === 'Missa Dominical' ? '#f39c12' : '#3498db'} />
          <Text style={[styles.massType, { color: item.type === 'Missa Dominical' ? '#f39c12' : '#3498db' }]}>{item.type}</Text>
        </View>
        {item.church && (
          <>
            <View style={styles.churchRow}>
              <Ionicons name="church-outline" size={14} color="#2c3e50" />
              <Text style={styles.churchName}>{item.church.name}</Text>
            </View>
            {item.church.address && (
              <Text style={styles.churchAddress} numberOfLines={1}>{item.church.address}</Text>
            )}
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
             await Notifications.scheduleNotificationAsync({
               content: {
                 title: 'Lembrete de Missa',
                 body: `Missa às ${item.time} na ${item.church ? item.church.name : 'Paróquia'}.`,
               },
               trigger: { seconds: 2 },
             });
             toast.success('Lembrete configurado!');
          } else {
             toast.error('Permissão de notificação negada.');
          }
        }}
      >
        <Ionicons name="notifications-outline" size={20} color="#3498db" />
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section }) => {
    const count = section.data.length;
    return (
      <View style={styles.daySection}>
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <Ionicons name="calendar" size={18} color="#2c3e50" />
            <Text style={styles.dayTitle}>{section.day}</Text>
          </View>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{count} {count === 1 ? 'missa' : 'missas'}</Text>
          </View>
        </View>
        {section.data.map((item, index) => renderMassItem({ item, index }))}
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filtersHeader}>
        <Text style={styles.filterLabel}>Dia da semana</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Ionicons name="close" size={14} color="#e74c3c" />
            <Text style={styles.clearText}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal
        data={DAYS_OF_WEEK}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.dayFilterButton,
              selectedDay === item.key && styles.dayFilterButtonActive,
            ]}
            onPress={() => setSelectedDay(item.key)}
          >
            <Text
              style={[
                styles.dayFilterText,
                selectedDay === item.key && styles.dayFilterTextActive,
              ]}
            >
              {item.short}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayFiltersList}
      />

      {uniqueTypes.length > 1 && (
        <>
          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Tipo de missa</Text>
          <FlatList
            horizontal
            data={[{ key: 'all', label: 'Todos' }, ...uniqueTypes.map(t => ({ key: t, label: t }))]}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.typeFilterButton, massType === item.key && styles.typeFilterButtonActive]}
                onPress={() => setMassType(item.key)}
              >
                <Ionicons
                  name={item.key === 'all' ? 'apps' : item.key === 'Missa Dominical' ? 'sunny' : 'moon'}
                  size={14}
                  color={massType === item.key ? '#fff' : '#7f8c8d'}
                />
                <Text style={[styles.typeFilterText, massType === item.key && styles.typeFilterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayFiltersList}
          />
        </>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderFilters()}
        <ListSkeleton count={5} type="mass" />
      </View>
    );
  }

  if (error && masses.length === 0) {
    return (
      <View style={styles.container}>
        <NetworkStatus />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMasses}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalMasses = filteredMasses.reduce((acc, day) => acc + day.data.length, 0);

  return (
    <View style={styles.container}>
      <NetworkStatus />
      {renderFilters()}

      <View style={styles.statsBar}>
        <Ionicons name="information-circle-outline" size={16} color="#7f8c8d" />
        <Text style={styles.statsText}>
          {totalMasses} {totalMasses === 1 ? 'missa encontrada' : 'missas encontradas'}
          {hasActiveFilters && ' (filtrado)'}
        </Text>
      </View>

      <SectionList
        sections={filteredMasses}
        renderItem={renderMassItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>Nenhuma missa encontrada</Text>
            <Text style={styles.emptyText}>
              Não há missas cadastradas para os filtros selecionados.
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
                <Text style={styles.emptyButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2c3e50']}
            tintColor="#2c3e50"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  dayFiltersList: {
    paddingRight: 16,
  },
  dayFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
  },
  dayFilterButtonActive: {
    backgroundColor: '#2c3e50',
  },
  dayFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  dayFilterTextActive: {
    color: '#fff',
  },
  typeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f4f8',
    gap: 6,
  },
  typeFilterButtonActive: {
    backgroundColor: '#27ae60',
  },
  typeFilterText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  typeFilterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  statsText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  daySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  dayBadge: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2c3e50',
  },
  massCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    elevation: 2,
    backgroundColor: '#fff',
  },
  massTimeContainer: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 14,
  },
  massTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  massInfo: {
    flex: 1,
  },
  notificationButton: {
    padding: 10,
    marginLeft: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  massType: {
    fontSize: 13,
    fontWeight: '600',
  },
  churchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  churchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 6,
  },
  churchAddress: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});