import { useEffect, useState } from 'react';
import { getChurchById } from '../../services/api';
import { FavoritesService } from '../../services/FavoritesService';
import { useToast } from '../../context/ToastContext';

// Carrega a igreja (com missas, pároco e próxima missa) e o estado de favorito.
export function useChurchDetail(churchId) {
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      setChurch(await getChurchById(churchId));
      setError(null);
    } catch (err) {
      setError('Puxa, não conseguimos carregar os detalhes da igreja agora. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    FavoritesService.getFavoriteChurches().then((favs) => setIsFavorite(favs.some((f) => f.id === churchId)));
  }, [churchId]);

  const toggleFavorite = async () => {
    if (isFavorite) {
      await FavoritesService.removeFavoriteChurch(church.id);
      toast.info(`${church.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoriteChurch(church);
      toast.success(`${church.name} adicionado aos favoritos!`);
    }
    setIsFavorite(!isFavorite);
  };

  return { church, loading, error, isFavorite, reload: load, toggleFavorite };
}
