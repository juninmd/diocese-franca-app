import { useEffect, useMemo, useState } from 'react';
import { useChurch } from '../../hooks/useData';
import { FavoritesService } from '../../services/FavoritesService';
import { useToast } from '../../context/ToastContext';
import { computeNextMass } from '../../utils/massTime';

// Carrega a igreja (com missas e pároco) e o estado de favorito. A próxima missa é recalculada
// no aparelho a partir das missas, para não depender da hora em que o dado foi guardado em cache.
export function useChurchDetail(churchId) {
  const resource = useChurch(churchId);
  const data = resource.data;
  const church = useMemo(() => (data ? { ...data, nextMass: computeNextMass(data.masses) } : null), [data]);
  const [isFavorite, setIsFavorite] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    FavoritesService.getFavoriteChurches().then((favs) => active && setIsFavorite(favs.some((f) => f.id === churchId)));
    return () => { active = false; };
  }, [churchId]);

  const toggleFavorite = async () => {
    if (!church) return;
    if (isFavorite) {
      await FavoritesService.removeFavoriteChurch(church.id);
      toast.info(`${church.name} removido dos favoritos`);
    } else {
      await FavoritesService.addFavoriteChurch(church);
      toast.success(`${church.name} adicionado aos favoritos!`);
    }
    setIsFavorite(!isFavorite);
  };

  const error = resource.error && !church
    ? 'Puxa, não conseguimos carregar os detalhes da igreja agora. Tente novamente!'
    : null;

  return { church, loading: resource.loading, error, stale: resource.stale, isFavorite, reload: () => resource.reload(), toggleFavorite };
}
