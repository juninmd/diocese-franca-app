import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getPriestById } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PriestDetailScreen({ route }) {
  const { priestId } = route.params;
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

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
      setError('Puxa, não conseguimos carregar os detalhes do padre agora. Tente novamente!');
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

  const handleMap = (church) => {
    if (church && church.address) {
      const query = encodeURIComponent(`${church.name}, ${church.address}, ${church.city}`);
      Linking.openURL(`https://maps.google.com/?q=${query}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error || !priest) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>{error || 'Puxa, não encontramos o padre'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPriestDetail}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {priest.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.title}>{priest.name}</Text>
        <View style={styles.titleBadge}>
          <Ionicons name="star" size={14} color="#f39c12" />
          <Text style={styles.titleBadgeText}>{priest.title}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {priest.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biografia</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{priest.bio}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <View style={styles.contactCard}>
            {priest.email && (
              <TouchableOpacity style={styles.contactRow} onPress={() => handleEmail(priest.email)} activeOpacity={0.8}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#2c3e50" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{priest.email}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#3498db" />
              </TouchableOpacity>
            )}

            {priest.phone && (
              <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(priest.phone)} activeOpacity={0.8}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call-outline" size={20} color="#2c3e50" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Telefone</Text>
                  <Text style={styles.contactValue}>{priest.phone}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#3498db" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.contactRow}
              activeOpacity={0.8}
              onPress={async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Lembrete de Confissão',
                      body: `Agendar confissão ou atendimento com ${priest.title} ${priest.name}.`,
                    },
                    trigger: { seconds: 2 },
                  });
                  toast.success('Lembrete configurado!');
                } else {
                  toast.error('Permissão de notificação negada.');
                }
              }}
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="time-outline" size={20} color="#8e44ad" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Lembrete Confissão</Text>
                <Text style={styles.contactValue}>Configurar alerta</Text>
              </View>
              <Ionicons name="notifications-outline" size={18} color="#8e44ad" />
            </TouchableOpacity>
          </View>
        </View>

        {priest.church && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paróquia</Text>
            <TouchableOpacity style={styles.churchCard} onPress={() => handleMap(priest.church)} activeOpacity={0.8}>
              <View style={styles.churchIconContainer}>
                <Ionicons name="church" size={28} color="#fff" />
              </View>
              <View style={styles.churchInfo}>
                <Text style={styles.churchName}>{priest.church.name}</Text>
                {priest.church.address && (
                  <Text style={styles.churchAddress} numberOfLines={2}>{priest.church.address}</Text>
                )}
                {priest.church.city && (
                  <Text style={styles.churchCity}>{priest.church.city} - {priest.church.state}</Text>
                )}
              </View>
              <Ionicons name="navigate-outline" size={24} color="#3498db" />
            </TouchableOpacity>
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
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  titleBadgeText: {
    fontSize: 14,
    color: '#ecf0f1',
    marginLeft: 6,
  },
  content: {
    padding: 16,
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
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  bioText: {
    fontSize: 15,
    color: '#5d6d7e',
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
    marginLeft: 14,
  },
  contactLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  churchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  churchInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  churchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  churchAddress: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  churchCity: {
    fontSize: 12,
    color: '#95a5a6',
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