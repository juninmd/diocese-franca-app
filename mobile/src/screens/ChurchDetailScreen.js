import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getChurchById } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatNextMass } from '../utils/massTime';

export default function ChurchDetailScreen({ route }) {
  const { churchId } = route.params;
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

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
      setError('Puxa, não conseguimos carregar os detalhes da igreja agora. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleMap = (address) => {
    const query = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error || !church) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>{error || 'Puxa, não encontramos a igreja'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChurchDetail}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedMasses = church.masses?.reduce((acc, mass) => {
    if (!acc[mass.dayOfWeek]) {
      acc[mass.dayOfWeek] = [];
    }
    acc[mass.dayOfWeek].push(mass);
    return acc;
  }, {}) || {};

  const dayOrder = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const sortedDays = Object.keys(groupedMasses).sort((a, b) => {
    return dayOrder.indexOf(a) - dayOrder.indexOf(b);
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="church" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>{church.name}</Text>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={14} color="#ecf0f1" />
          <Text style={styles.locationText}>{church.city} - {church.state}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {church.nextMass && (
          <View style={styles.nextMassBanner}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.nextMassText}>Próxima missa: {formatNextMass(church.nextMass)}</Text>
          </View>
        )}

        {church.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.description}>{church.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity style={styles.infoRow} onPress={() => handleMap(church.address)} activeOpacity={0.8}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="map-outline" size={20} color="#2c3e50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{church.address}</Text>
                <Text style={styles.infoSecondary}>{church.city} - {church.state}, CEP: {church.zipCode}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#3498db" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(church.phone)} activeOpacity={0.8}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call-outline" size={20} color="#2c3e50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{church.phone}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.infoRow}
              activeOpacity={0.8}
              onPress={async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Lembrete de Visita',
                      body: `Lembrete: Visitar a paróquia ${church.name}.`,
                    },
                    trigger: { seconds: 2 },
                  });
                  toast.success('Lembrete de visita agendado!');
                } else {
                  toast.error('Permissão de notificação negada.');
                }
              }}
            >
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#27ae60" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Agendar Visita</Text>
                <Text style={styles.infoValue}>Receber um lembrete</Text>
              </View>
              <Ionicons name="notifications-outline" size={18} color="#27ae60" />
            </TouchableOpacity>
          </View>
        </View>

        {church.priest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pároco</Text>
            <View style={styles.priestCard}>
              <View style={styles.priestAvatar}>
                <Ionicons name="person" size={32} color="#fff" />
              </View>
              <View style={styles.priestInfo}>
                <Text style={styles.priestName}>{church.priest.name}</Text>
                <Text style={styles.priestTitle}>{church.priest.title}</Text>
                {church.priest.bio && <Text style={styles.priestBio}>{church.priest.bio}</Text>}
              </View>
            </View>
            <View style={styles.priestContact}>
              {church.priest.email && (
                <TouchableOpacity style={styles.contactButton} onPress={() => handleEmail(church.priest.email)} activeOpacity={0.8}>
                  <Ionicons name="mail-outline" size={18} color="#fff" />
                  <Text style={styles.contactButtonText}>Email</Text>
                </TouchableOpacity>
              )}
              {church.priest.phone && (
                <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(church.priest.phone)} activeOpacity={0.8}>
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text style={styles.contactButtonText}>Ligar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {church.masses && church.masses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horários de Missa</Text>
            <Text style={styles.massCount}>{church.masses.length} missas cadastradas</Text>
            {sortedDays.map((day) => (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Ionicons name="calendar" size={18} color="#2c3e50" />
                  <Text style={styles.dayName}>{day}</Text>
                </View>
                {groupedMasses[day].map((mass) => (
                  <View key={mass.id} style={styles.massRow}>
                    <View style={styles.massTimeContainer}>
                      <Text style={styles.massTime}>{mass.time}</Text>
                    </View>
                    <View style={styles.massDetails}>
                      <Text style={styles.massType}>{mass.type}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 13,
    color: '#ecf0f1',
    marginLeft: 6,
  },
  content: {
    padding: 16,
  },
  nextMassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  nextMassText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#5d6d7e',
    lineHeight: 22,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  infoSecondary: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  priestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priestAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priestInfo: {
    flex: 1,
    marginLeft: 14,
  },
  priestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  priestTitle: {
    fontSize: 14,
    color: '#d35400',
    marginTop: 2,
  },
  priestBio: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 8,
    lineHeight: 18,
  },
  priestContact: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  massCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
    marginTop: -8,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  dayName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  massRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  massTimeContainer: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  massTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  massDetails: {
    flex: 1,
    marginLeft: 12,
  },
  massType: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});