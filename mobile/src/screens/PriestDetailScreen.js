import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getPriestById } from '../services/api';

export default function PriestDetailScreen({ route }) {
  const { priestId } = route.params;
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPriestDetail();
  }, [priestId]);

  const loadPriestDetail = async () => {
    try {
      setLoading(true);
      const data = await getPriestById(priestId);
      setPriest(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar detalhes do padre.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (error || !priest) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Padre não encontrado'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPriestDetail}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{priest.name}</Text>
        <Text style={styles.subtitle}>{priest.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        {priest.bio && <Text style={styles.bio}>{priest.bio}</Text>}
        
        {priest.email && (
          <>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{priest.email}</Text>
          </>
        )}
        
        {priest.phone && (
          <>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.info}>{priest.phone}</Text>
          </>
        )}
      </View>

      {priest.church && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paróquia</Text>
          <Text style={styles.churchName}>{priest.church.name}</Text>
          <Text style={styles.info}>{priest.church.address}</Text>
          <Text style={styles.info}>{priest.church.city} - {priest.church.state}</Text>
        </View>
      )}
    </ScrollView>
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
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 8,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 12,
    lineHeight: 20,
  },
  churchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
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
