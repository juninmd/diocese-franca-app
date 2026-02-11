import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getChurchById } from '../services/api';

export default function ChurchDetailScreen({ route }) {
  const { churchId } = route.params;
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChurchDetail();
  }, [churchId]);

  const loadChurchDetail = async () => {
    try {
      setLoading(true);
      const data = await getChurchById(churchId);
      setChurch(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar detalhes da igreja.');
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

  if (error || !church) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Igreja não encontrada'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChurchDetail}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{church.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <Text style={styles.info}>{church.description}</Text>
        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.info}>{church.address}</Text>
        <Text style={styles.info}>{church.city} - {church.state}</Text>
        <Text style={styles.info}>CEP: {church.zipCode}</Text>
        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.info}>{church.phone}</Text>
      </View>

      {church.priest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pároco</Text>
          <Text style={styles.priestName}>{church.priest.name}</Text>
          <Text style={styles.info}>{church.priest.title}</Text>
          {church.priest.email && <Text style={styles.info}>Email: {church.priest.email}</Text>}
          {church.priest.bio && <Text style={styles.info}>{church.priest.bio}</Text>}
        </View>
      )}

      {church.masses && church.masses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários de Missa</Text>
          {church.masses.map((mass) => (
            <View key={mass.id} style={styles.massItem}>
              <Text style={styles.massDay}>{mass.dayOfWeek}</Text>
              <Text style={styles.massTime}>{mass.time}</Text>
              <Text style={styles.massType}>{mass.type}</Text>
            </View>
          ))}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
    lineHeight: 20,
  },
  priestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  massItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  massDay: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 2,
  },
  massTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    flex: 1,
    textAlign: 'center',
  },
  massType: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
    textAlign: 'right',
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
