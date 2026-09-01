import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getChurches, getNearbyChurches } from '../services/api';
import { LocationService } from '../services/LocationService';
import { FavoritesService } from '../services/FavoritesService';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { formatNextMass, formatDistance } from '../utils/massTime';

export default function ChurchesScreen({ navigation }) {
  const [churches, setChurches] = useState([]);
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites' | 'nearby'
  const [nearbyChurches, setNearbyChurches] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadChurches();
    loadFavorites();
  }, []);

  useEffect(() => {
    const baseList = filterMode === 'nearby'
      ? nearbyChurches
      : filterMode === 'favorites'
        ? churches.filter(c => favorites.includes(c.id))
        : churches;

    if (searchQuery.trim() === '') {
      setFilteredChurches(baseList);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChurches(baseList.filter(
        (church) =>
          church.name.toLowerCase().includes(query) ||
          church.address.toLowerCase().includes(query) ||
          church.city.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, churches, filterMode, favorites, nearbyChurches]);

  const loadNearbyChurches = async () => {
    setNearbyLoading(true);
    setNearbyError(null);
    const { granted, coords } = await LocationService.getCurrentPosition();
    if (!granted || !coords) {
      setNearbyError('Precisamos da sua localização para mostrar as igrejas mais próximas. Verifique a permissão de localização nas configurações.');
      setNearbyLoading(false);
      return;
    }
    try {
      const data = await getNearbyChurches(coords.latitude, coords.longitude);
      setNearbyChurches(data && data.success ? data.data : []);
    } catch (err) {
      setNearbyError('Não conseguimos calcular as igrejas próximas agora. Tente novamente.');
    } finally {
      setNearbyLoading(false);
    }
  };

  const selectFilterMode = (mode) => {
    setFilterMode(mode);
    if (mode === 'nearby' && nearbyChurches.length === 0 && !nearbyLoading) {
      loadNearbyChurches();
    }
  };

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await getChurches();
      setChurches(data);
      setFilteredChurches(filterMode === 'favorites' ? data.filter(c => favorites.includes(c.id)) : data);
      setError(null);
    } catch (err) {
      setError('Puxa, não conseguimos carregar as igrejas agora. Verifique sua conexão e tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favs = await FavoritesService.getFavoriteChurches();
    setFavorites(favs.map(f => f.id));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChurches();
    await loadFavorites();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  }, []);

  const toggleFavorite = async (church) => {
    const isFav = favorites.includes(church.id);
    if (isFav) {
      await FavoritesService.removeFavoriteChurch(church.id);
      setFavorites(prev => prev.filter(id => id !== church.id));
      toast.info(`${church.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoriteChurch(church);
      setFavorites(prev => [...prev, church.id]);
      toast.success(`${church.name} adicionado aos favoritos!`);
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
         await Notifications.scheduleNotificationAsync({
           content: {
             title: 'Igreja Favoritada! ❤️',
             body: `Você favoritou a paróquia ${church.name}.`,
           },
           trigger: { seconds: 2 },
         });
      }
    }
  };

  const handleShare = async (church) => {
    try {
      await Share.share({
        title: church.name,
        message: `Confira a ${church.name}\nEndereço: ${church.address}\nTelefone: ${church.phone}\n\nCompartilhado via Diocese de Franca`,
      });
    } catch (error) {
      toast.error('Erro ao compartilhar');
    }
  };

  const renderChurch = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ChurchDetail', { churchId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="church" size={28} color="#2c3e50" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.churchName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#95a5a6" />
              <Text style={styles.churchLocation} numberOfLines={1}>
                {item.city} - {item.state}
              </Text>
              {item.distanceKm !== undefined && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>{formatDistance(item.distanceKm)}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.actionButton}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#e74c3c' : '#bdc3c7'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color="#bdc3c7" />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="map-outline" size={14} color="#7f8c8d" />
            <Text style={styles.footerText} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="call-outline" size={14} color="#3498db" />
            <Text style={styles.footerPhone}>{item.phone}</Text>
          </View>
          {item.nextMass && (
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color="#27ae60" />
              <Text style={styles.footerNextMass}>Próxima missa: {formatNextMass(item.nextMass)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // "Sem localização ainda" só se aplica quando o modo nearby não tem nenhum resultado
  // carregado — se já há igrejas próximas e a busca é que não encontrou nada, cai no
  // caso genérico de busca sem resultados.
  const isAwaitingLocation = filterMode === 'nearby' && !nearbyError && nearbyChurches.length === 0;

  const renderEmptyList = () => {
    if (filterMode === 'nearby' && nearbyLoading) {
      return <ListSkeleton count={3} type="church" />;
    }

    const icon = error || nearbyError
      ? 'alert-circle-outline'
      : isAwaitingLocation
        ? 'navigate-outline'
        : filterMode === 'favorites'
          ? 'heart-outline'
          : 'search-outline';

    const title = error
      ? 'Puxa, não conseguimos carregar as igrejas agora. Tente novamente!'
      : nearbyError
        ? 'Não conseguimos encontrar igrejas perto de você.'
        : isAwaitingLocation
          ? 'Ainda não sabemos onde você está.'
          : filterMode === 'favorites'
            ? 'Você ainda não favoritou nenhuma paróquia.'
            : 'Puxa, não encontramos paróquias com este nome.';

    const subtitle = error
      ? error
      : nearbyError
        ? nearbyError
        : isAwaitingLocation
          ? 'Toque em "Tentar novamente" e permita o acesso à localização para ver as igrejas mais próximas de você.'
          : filterMode === 'favorites'
            ? 'Adicione igrejas aos favoritos para acessá-las rapidamente'
            : searchQuery ? 'Que tal tentar outra busca?' : 'Não foi possível carregar as igrejas no momento.';

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={icon} size={64} color="#bdc3c7" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{subtitle}</Text>
        {filterMode === 'favorites' && !error && (
          <TouchableOpacity style={styles.emptyButton} onPress={() => selectFilterMode('all')}>
            <Text style={styles.emptyButtonText}>Ver todas as igrejas</Text>
          </TouchableOpacity>
        )}
        {filterMode === 'nearby' && !nearbyLoading && (
          <TouchableOpacity style={styles.emptyButton} onPress={loadNearbyChurches}>
            <Text style={styles.emptyButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
        {error && (
          <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
            <Text style={styles.emptyButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#95a5a6" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Buscar..." editable={false} />
        </View>
        <ListSkeleton count={5} type="church" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#95a5a6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, endereço ou cidade..."
          placeholderTextColor="#bdc3c7"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#95a5a6" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'all' && styles.filterChipActive]}
          onPress={() => selectFilterMode('all')}
        >
          <Ionicons name="business" size={16} color={filterMode === 'all' ? '#fff' : '#7f8c8d'} />
          <Text style={[styles.filterChipText, filterMode === 'all' && styles.filterChipTextActive]}>
            Todas ({churches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'favorites' && styles.filterChipActive]}
          onPress={() => selectFilterMode('favorites')}
        >
          <Ionicons name="heart" size={16} color={filterMode === 'favorites' ? '#fff' : '#e74c3c'} />
          <Text style={[styles.filterChipText, filterMode === 'favorites' && styles.filterChipTextActive]}>
            Favoritas ({favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'nearby' && styles.filterChipActive]}
          onPress={() => selectFilterMode('nearby')}
        >
          <Ionicons name="navigate" size={16} color={filterMode === 'nearby' ? '#fff' : '#3498db'} />
          <Text style={[styles.filterChipText, filterMode === 'nearby' && styles.filterChipTextActive]}>
            Perto de mim
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChurches}
        renderItem={renderChurch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
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
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#2c3e50',
  },
  filterChipText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  churchName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  churchLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  distanceBadge: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  distanceBadgeText: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f8',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  footerPhone: {
    fontSize: 13,
    color: '#3498db',
    marginLeft: 8,
  },
  footerNextMass: {
    fontSize: 13,
    color: '#27ae60',
    marginLeft: 8,
    fontWeight: '600',
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
    paddingHorizontal: 32,
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
});