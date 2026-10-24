import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePriests } from '../hooks/useData';
import { FavoritesService } from '../services/FavoritesService';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { Text } from '../components/ui';
import { BishopCard } from '../components/priests/BishopCard';
import { PriestCard } from '../components/priests/PriestCard';
import { PriestsFilters } from '../components/priests/PriestsFilters';
import { PriestsEmpty } from '../components/priests/PriestsEmpty';
import { colors, space } from '../theme';

const EMPTY = [];

const matches = (p, q) =>
  [p.name, p.title, p.email, p.church && p.church.city].some((field) => field && field.toLowerCase().includes(q));

export default function PriestsScreen({ navigation }) {
  const resource = usePriests();
  const priests = resource.data || EMPTY;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const toast = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await FavoritesService.getFavoritePriests();
    setFavorites(favs.map((f) => f.id));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const [result] = await Promise.all([resource.reload(), loadFavorites()]);
    setRefreshing(false);
    if (result && !result.stale) toast.success('Dados atualizados!');
    else toast.warning('Sem conexão: mostrando os dados salvos.');
  };

  const toggleFavorite = async (priest) => {
    if (favorites.includes(priest.id)) {
      await FavoritesService.removeFavoritePriest(priest.id);
      setFavorites((prev) => prev.filter((id) => id !== priest.id));
      toast.info(`${priest.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoritePriest(priest);
      setFavorites((prev) => [...prev, priest.id]);
      toast.success(`${priest.name} adicionado aos favoritos!`);
    }
  };

  const handleShare = async (priest) => {
    try {
      await Share.share({
        title: priest.name,
        message: `${priest.title}\n${priest.name}\n${priest.bio || ''}\n\nCompartilhado via Diocese de Franca`,
      });
    } catch (error) {
      toast.error('Puxa, erro ao compartilhar');
    }
  };

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return priests.filter((p) => (!showFavorites || favorites.includes(p.id)) && (!q || matches(p, q)));
  }, [searchQuery, priests, showFavorites, favorites]);
  const bishop = visible.find((p) => /bispo/i.test(p.title));
  const parishPriests = visible.filter((p) => p !== bishop);

  const cardProps = (p) => ({
    priest: p,
    isFavorite: favorites.includes(p.id),
    onOpen: () => navigation.navigate('PriestDetail', { priestId: p.id }),
    onFavorite: () => toggleFavorite(p),
    onShare: () => handleShare(p),
  });

  const header = (
    <View style={styles.header}>
      <View style={{ gap: 4 }}>
        <Text variant="display">Clero</Text>
        <Text variant="body" style={{ color: colors.muted }}>Bispo e párocos da Diocese de Franca</Text>
      </View>
      <PriestsFilters
        loading={resource.loading && !refreshing}
        query={searchQuery}
        onQuery={setSearchQuery}
        showFavorites={showFavorites}
        onShowFavorites={setShowFavorites}
        total={priests.length}
        favCount={favorites.length}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + space.lg }]}>
      {resource.loading && !refreshing ? (
        <View style={styles.pad}>{header}<ListSkeleton count={5} type="priest" /></View>
      ) : (
        <FlatList
          data={parishPriests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PriestCard {...cardProps(item)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {header}
              {bishop && <BishopCard {...cardProps(bishop)} />}
              {parishPriests.length > 0 && <Text variant="title">Párocos</Text>}
            </View>
          }
          ListEmptyComponent={bishop ? null : (
            <PriestsEmpty
              showFavorites={showFavorites}
              hasQuery={!!searchQuery}
              failed={!!resource.error && priests.length === 0}
              onShowAll={() => setShowFavorites(false)}
              onRetry={() => resource.reload()}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 20 },
  header: { gap: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 110, gap: 12 },
  listHeader: { gap: 20, marginBottom: 4 },
});
