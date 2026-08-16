import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { getPriests } from '../services/api';
import { FavoritesService } from '../services/FavoritesService';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';

export default function PriestsScreen({ navigation }) {
  const [priests, setPriests] = useState([]);
  const [filteredPriests, setFilteredPriests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadPriests();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPriests(showFavorites ? priests.filter(p => favorites.includes(p.id)) : priests);
    } else {
      const query = searchQuery.toLowerCase();
      let filtered = priests.filter(
        (priest) =>
          priest.name.toLowerCase().includes(query) ||
          priest.title.toLowerCase().includes(query) ||
          (priest.email && priest.email.toLowerCase().includes(query))
      );
      if (showFavorites) {
        filtered = filtered.filter(p => favorites.includes(p.id));
      }
      setFilteredPriests(filtered);
    }
  }, [searchQuery, priests, showFavorites, favorites]);

  const loadPriests = async () => {
    try {
      setLoading(true);
      const data = await getPriests();
      setPriests(data);
      setFilteredPriests(showFavorites ? data.filter(p => favorites.includes(p.id)) : data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar padres. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favs = await FavoritesService.getFavoritePriests();
    setFavorites(favs.map(f => f.id));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPriests();
    await loadFavorites();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  }, []);

  const toggleFavorite = async (priest) => {
    const isFav = favorites.includes(priest.id);
    if (isFav) {
      await FavoritesService.removeFavoritePriest(priest.id);
      setFavorites(prev => prev.filter(id => id !== priest.id));
      toast.info(`${priest.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoritePriest(priest);
      setFavorites(prev => [...prev, priest.id]);
      toast.success(`${priest.name} adicionado aos favoritos!`);
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
         await Notifications.scheduleNotificationAsync({
           content: {
             title: 'Padre Favoritado! 🙏',
             body: `Você favoritou o ${priest.title} ${priest.name}.`,
           },
           trigger: null,
         });
      }
    }
  };

  const handleShare = async (priest) => {
    try {
      await Share.share({
        title: priest.name,
        message: `${priest.title}\n${priest.name}\n${priest.bio || ''}\n\nCompartilhado via Diocese de Franca`,
      });
    } catch (error) {
      toast.error('Erro ao compartilhar');
    }
  };

  const renderPriest = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PriestDetail', { priestId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.priestName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.titleBadge}>
            <Ionicons name="star" size={12} color="#d35400" />
            <Text style={styles.priestTitle}>{item.title}</Text>
          </View>
          {item.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={12} color="#7f8c8d" />
              <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
            </View>
          )}
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
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={showFavorites ? 'heart-outline' : 'person-outline'} size={64} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>
        {showFavorites ? 'Nenhum padre favorito' : 'Nenhum padre encontrado'}
      </Text>
      <Text style={styles.emptyText}>
        {showFavorites
          ? 'Adicione padres aos favoritos para acessá-los rapidamente'
          : searchQuery ? 'Tente buscar com outros termos' : 'Não foi possível carregar os padres'}
      </Text>
      {showFavorites && (
        <TouchableOpacity style={styles.emptyButton} onPress={() => setShowFavorites(false)}>
          <Text style={styles.emptyButtonText}>Ver todos os padres</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#95a5a6" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Buscar..." editable={false} />
        </View>
        <ListSkeleton count={5} type="priest" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#95a5a6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou título..."
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
          style={[styles.filterChip, !showFavorites && styles.filterChipActive]}
          onPress={() => setShowFavorites(false)}
        >
          <Ionicons name="people" size={16} color={!showFavorites ? '#fff' : '#7f8c8d'} />
          <Text style={[styles.filterChipText, !showFavorites && styles.filterChipTextActive]}>
            Todos ({priests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, showFavorites && styles.filterChipActive]}
          onPress={() => setShowFavorites(true)}
        >
          <Ionicons name="heart" size={16} color={showFavorites ? '#fff' : '#e74c3c'} />
          <Text style={[styles.filterChipText, showFavorites && styles.filterChipTextActive]}>
            Favoritos ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPriests}
        renderItem={renderPriest}
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
    paddingVertical: 8,
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
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  priestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  priestTitle: {
    fontSize: 12,
    color: '#d35400',
    fontWeight: '600',
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
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