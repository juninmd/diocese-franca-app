import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getChurches, getPriests, getMasses, getNews } from '../services/api';
import { useToast } from '../context/ToastContext';
import { NetworkStatus } from '../components/NetworkStatus';
import { NewsCardSkeleton } from '../components/Skeleton';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ churches: 0, priests: 0, masses: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadStats();
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const data = await getNews();
      if (data && data.success && data.data) {
        setNews(data.data);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error("Failed to load news", err);
    } finally {
      setLoadingNews(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const [churches, priests, masses] = await Promise.all([
        getChurches(),
        getPriests(),
        getMasses(),
      ]);
      setStats({
        churches: churches.length,
        priests: priests.length,
        masses: masses.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), fetchNews()]);
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <NetworkStatus />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2c3e50']}
            tintColor="#2c3e50"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="church" size={60} color="#fff" />
          </View>
          <Text style={styles.title}> Diocese de Franca</Text>
          <Text style={styles.subtitle}>Aplicativo Oficial</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
          <Text style={styles.welcomeText}>
            Conheça as paróquias, padres e horários de missa da Diocese de Franca.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color="#2c3e50" />
            <Text style={styles.refreshText}>Atualizar dados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Churches')}>
            <View style={[styles.statIcon, { backgroundColor: '#e8f4f8' }]}>
              <Ionicons name="business" size={24} color="#2c3e50" />
            </View>
            <Text style={styles.statNumber}>{stats.churches}</Text>
            <Text style={styles.statLabel}>Paróquias</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Priests')}>
            <View style={[styles.statIcon, { backgroundColor: '#fef5e7' }]}>
              <Ionicons name="person" size={24} color="#d35400" />
            </View>
            <Text style={styles.statNumber}>{stats.priests}</Text>
            <Text style={styles.statLabel}>Padres</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Masses')}>
            <View style={[styles.statIcon, { backgroundColor: '#e8f8f5' }]}>
              <Ionicons name="calendar" size={24} color="#27ae60" />
            </View>
            <Text style={styles.statNumber}>{stats.masses}</Text>
            <Text style={styles.statLabel}>Missas/sem</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.newsContainer}>
          <Text style={styles.sectionTitle}>Notícias da Diocese</Text>
          {loadingNews ? (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsList}>
               <NewsCardSkeleton />
               <NewsCardSkeleton />
               <NewsCardSkeleton />
             </ScrollView>
          ) : news.length > 0 ? (
            <FlatList
              horizontal
              data={news}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.newsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.newsCard}
                  onPress={() => Linking.openURL(item.link)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.image }} style={styles.newsImage} />
                  <View style={styles.newsContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhuma notícia encontrada.</Text>
          )}
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Navegue</Text>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Churches')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#e8f4f8' }]}>
              <Ionicons name="church-outline" size={32} color="#2c3e50" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Igrejas</Text>
              <Text style={styles.menuDescription}>Veja todas as paróquias e suas informações</Text>
            </View>
            <View style={styles.menuArrow}>
              <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Priests')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#fef5e7' }]}>
              <Ionicons name="person-outline" size={32} color="#d35400" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Padres</Text>
              <Text style={styles.menuDescription}>Conheça nossos sacerdotes</Text>
            </View>
            <View style={styles.menuArrow}>
              <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Masses')}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#e8f8f5' }]}>
              <Ionicons name="time-outline" size={32} color="#27ae60" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Horários de Missa</Text>
              <Text style={styles.menuDescription}>Consulte os horários por dia da semana</Text>
            </View>
            <View style={styles.menuArrow}>
              <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => navigation.navigate('Masses', { day: 'Domingo' })}
            >
              <Ionicons name="sunny" size={28} color="#f39c12" />
              <Text style={styles.quickText}>Missa{'\n'}Domingo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Lembrete da Diocese',
                      body: 'Não se esqueça da leitura do Evangelho de hoje!',
                    },
                    trigger: { seconds: 5 },
                  });
                  toast.success('Lembrete agendado!');
                } else {
                  toast.error('Permissão de notificação negada.');
                }
              }}
            >
              <Ionicons name="notifications" size={28} color="#e74c3c" />
              <Text style={styles.quickText}>Lembrete{'\n'}Diário</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => handleCall('1637111400')}
            >
              <Ionicons name="call" size={28} color="#27ae60" />
              <Text style={styles.quickText}>Ligar{'\n'}Diocese</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => handleEmail('contato@diocesefranca.org.br')}
            >
              <Ionicons name="mail" size={28} color="#9b59b6" />
              <Text style={styles.quickText}>Enviar{'\n'}Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contato da Diocese</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactItem} onPress={() => handleCall('1637111400')}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name="call-outline" size={20} color="#3498db" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Telefone</Text>
                <Text style={styles.contactText}>(16) 3711-1400</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={() => handleEmail('contato@diocesefranca.org.br')}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name="mail-outline" size={20} color="#3498db" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactText}>contato@diocesefranca.org.br</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.dioceseInfo}>
            <Ionicons name="location-outline" size={16} color="#7f8c8d" />
            <Text style={styles.dioceseInfoText}>Praça Nossa Senhora da Conceição, 85 - Centro</Text>
          </View>
          <View style={styles.dioceseInfo}>
            <Ionicons name="planet-outline" size={16} color="#7f8c8d" />
            <Text style={styles.dioceseInfoText}>Franca - SP, 14400-670</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bem-vindo, Fiel!</Text>
          <Text style={styles.footerSubtext}>Paróquia em Cristo</Text>
          <View style={styles.footerBadges}>
            <View style={styles.footerBadge}>
              <Ionicons name="heart" size={12} color="#e74c3c" />
              <Text style={styles.footerBadgeText}>Feito com amor</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  version: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    gap: 6,
  },
  refreshText: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 5,
  },
  menuContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  menuDescription: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 4,
  },
  menuArrow: {
    paddingLeft: 8,
  },
  newsContainer: {
    marginTop: 20,
  },
  newsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 240,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
    marginRight: 16,
  },
  newsImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#ecf0f1',
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 20,
  },
  loadingText: {
    paddingHorizontal: 16,
    color: '#7f8c8d',
  },
  emptyText: {
    paddingHorizontal: 16,
    color: '#7f8c8d',
  },
  quickAccess: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickText: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  contactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  contactRow: {
    gap: 12,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  contactText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  dioceseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  dioceseInfoText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
  },
  footerBadges: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  footerBadgeText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
});