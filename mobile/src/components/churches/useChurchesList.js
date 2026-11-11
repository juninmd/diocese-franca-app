import { useEffect, useState, useMemo, useCallback } from 'react';
import { Share } from 'react-native';
import { getNearbyChurches } from '../../services/api';
import { useChurches } from '../../hooks/useData';
import { LocationService, LOCATION_MESSAGES } from '../../services/LocationService';
import { FavoritesService } from '../../services/FavoritesService';
import { useToast } from '../../context/ToastContext';

const EMPTY = [];

const matches = (church, query) =>
  [church.name, church.address, church.city].some((field) => (field || '').toLowerCase().includes(query));

// Estado e ações da lista de igrejas: busca, filtros (todas/favoritas/perto), favoritos e compartilhamento.
export function useChurchesList(initialForania = null) {
  const resource = useChurches();
  const churches = resource.data || EMPTY;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites' | 'nearby'
  const [forania, setForania] = useState(initialForania);
  useEffect(() => { if (initialForania) setForania(initialForania); }, [initialForania]);
  const foranias = useMemo(() => [...new Set(churches.map((c) => c.forania).filter(Boolean))].sort(), [churches]);
  const [nearbyChurches, setNearbyChurches] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const toast = useToast();
  const error = resource.error && churches.length === 0
    ? 'Puxa, não conseguimos carregar as igrejas agora. Verifique sua conexão e tente novamente!'
    : null;

  const loadFavorites = async () => {
    const favs = await FavoritesService.getFavoriteChurches();
    setFavorites(favs.map((f) => f.id));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const filteredChurches = useMemo(() => {
    const baseList = filterMode === 'nearby'
      ? nearbyChurches
      : filterMode === 'favorites'
        ? churches.filter((c) => favorites.includes(c.id))
        : churches;
    const byForania = forania ? baseList.filter((c) => c.forania === forania) : baseList;
    const query = searchQuery.trim().toLowerCase();
    return query === '' ? byForania : byForania.filter((c) => matches(c, query));
  }, [searchQuery, churches, filterMode, favorites, nearbyChurches, forania]);

  const loadNearbyChurches = async () => {
    setNearbyLoading(true);
    setNearbyError(null);
    const { granted, coords, reason } = await LocationService.getCurrentPosition();
    if (!granted || !coords) {
      setNearbyError(LOCATION_MESSAGES[reason] || LOCATION_MESSAGES.denied);
      setNearbyLoading(false);
      return;
    }
    try {
      const data = await getNearbyChurches(coords.latitude, coords.longitude);
      setNearbyChurches(data && data.success ? data.data : []);
    } catch (err) {
      setNearbyError('Puxa, não conseguimos calcular as igrejas próximas agora. Tente novamente.');
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const [result] = await Promise.all([resource.reload(), loadFavorites()]);
    setRefreshing(false);
    if (result && !result.stale) toast.success('Dados atualizados!');
    else toast.warning('Sem conexão: mostrando os dados salvos.');
  }, [resource.reload, toast]);

  const toggleFavorite = async (church) => {
    if (favorites.includes(church.id)) {
      await FavoritesService.removeFavoriteChurch(church.id);
      setFavorites((prev) => prev.filter((id) => id !== church.id));
      toast.info(`${church.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoriteChurch(church);
      setFavorites((prev) => [...prev, church.id]);
      toast.success(`${church.name} adicionado aos favoritos!`);
    }
  };

  const shareChurch = async (church) => {
    try {
      await Share.share({
        title: church.name,
        message: `Confira a ${church.name}\nEndereço: ${church.address}, ${church.city}/${church.state}${church.phone ? `\nTelefone: ${church.phone}` : ''}\n\nCompartilhado via Diocese de Franca`,
      });
    } catch (err) {
      toast.error('Puxa, erro ao compartilhar');
    }
  };

  return {
    churches, filteredChurches, favorites, loading: resource.loading, refreshing, error, stale: resource.stale,
    searchQuery, setSearchQuery, filterMode, selectFilterMode, forania, setForania, foranias,
    nearbyChurches, nearbyLoading, nearbyError, loadNearbyChurches,
    onRefresh, toggleFavorite, shareChurch,
  };
}
