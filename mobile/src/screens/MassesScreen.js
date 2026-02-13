import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getMasses } from '../services/api';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function MassesScreen() {
  const [masses, setMasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    loadMasses();
  }, []);

  const loadMasses = async () => {
    try {
      setLoading(true);
      const data = await getMasses();
      setMasses(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar horários de missa. Verifique sua conexão.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMasses = selectedDay
    ? masses.filter((mass) => mass.dayOfWeek === selectedDay)
    : masses;

  const renderMass = ({ item }) => (
    <View style={styles.massCard}>
      <View style={styles.massHeader}>
        <Text style={styles.massTime}>{item.time}</Text>
        <Text style={styles.massDay}>{item.dayOfWeek}</Text>
      </View>
      <Text style={styles.massType}>{item.type}</Text>
      {item.church && (
        <>
          <Text style={styles.churchName}>{item.church.name}</Text>
          {item.church.address && (
            <Text style={styles.churchAddress}>{item.church.address}</Text>
          )}
        </>
      )}
    </View>
  );

  const renderDayFilter = (day) => (
    <TouchableOpacity
      key={day}
      style={[
        styles.filterButton,
        selectedDay === day && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedDay(selectedDay === day ? null : day)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedDay === day && styles.filterButtonTextActive,
        ]}
      >
        {day}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMasses}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={DAYS_OF_WEEK}
          renderItem={({ item }) => renderDayFilter(item)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <FlatList
        data={filteredMasses}
        renderItem={renderMass}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhuma missa encontrada para este dia.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  filterButtonActive: {
    backgroundColor: '#2c3e50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  massCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  massHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  massTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  massDay: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  massType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  churchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  churchAddress: {
    fontSize: 14,
    color: '#34495e',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
