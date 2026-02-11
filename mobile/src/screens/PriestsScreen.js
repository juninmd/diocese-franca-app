import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getPriests } from '../services/api';

export default function PriestsScreen({ navigation }) {
  const [priests, setPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPriests();
  }, []);

  const loadPriests = async () => {
    try {
      setLoading(true);
      const data = await getPriests();
      setPriests(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar padres. Verifique sua conexão.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPriest = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PriestDetail', { priestId: item.id })}
    >
      <Text style={styles.priestName}>{item.name}</Text>
      <Text style={styles.priestTitle}>{item.title}</Text>
      {item.email && <Text style={styles.priestEmail}>{item.email}</Text>}
      {item.phone && <Text style={styles.priestPhone}>{item.phone}</Text>}
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
        <TouchableOpacity style={styles.retryButton} onPress={loadPriests}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={priests}
        renderItem={renderPriest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 16,
  },
  card: {
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
  priestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  priestTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  priestEmail: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4,
  },
  priestPhone: {
    fontSize: 14,
    color: '#34495e',
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
