import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getChurches } from '../services/api';

export default function ChurchesScreen({ navigation }) {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await getChurches();
      setChurches(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar igrejas. Verifique sua conexão.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderChurch = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ChurchDetail', { churchId: item.id })}
    >
      <Text style={styles.churchName}>{item.name}</Text>
      <Text style={styles.churchAddress}>{item.address}</Text>
      <Text style={styles.churchCity}>{item.city} - {item.state}</Text>
      <Text style={styles.churchPhone}>{item.phone}</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadChurches}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={churches}
        renderItem={renderChurch}
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
  churchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  churchAddress: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  churchCity: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  churchPhone: {
    fontSize: 14,
    color: '#3498db',
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
