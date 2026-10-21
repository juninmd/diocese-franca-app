import React from 'react';
import { ListSkeleton } from '../Skeleton';
import { EmptyState } from '../ui';

// Estado vazio da lista, empático ("Puxa, ..."), conforme erro/filtro ativo.
export function ChurchesEmpty({ error, nearbyError, nearbyLoading, filterMode, nearbyCount, searchQuery, onRefresh, onFilter, onRetryNearby }) {
  if (filterMode === 'nearby' && nearbyLoading) return <ListSkeleton count={3} type="church" />;

  // "Sem localização ainda" só vale quando o modo nearby não tem resultado carregado.
  const awaitingLocation = filterMode === 'nearby' && !nearbyError && nearbyCount === 0;
  const favorites = filterMode === 'favorites';

  let icon = 'search-outline';
  let title = 'Puxa, não encontramos paróquias com este nome.';
  let subtitle = searchQuery ? 'Que tal tentar outra busca?' : 'Puxa, não conseguimos carregar as igrejas agora. Verifique sua conexão e tente novamente!';
  let action = null;

  if (error) {
    icon = 'alert-circle-outline';
    title = 'Puxa, não conseguimos carregar as igrejas agora. Tente novamente!';
    subtitle = error;
    action = { label: 'Tentar Novamente', run: onRefresh };
  } else if (nearbyError) {
    icon = 'alert-circle-outline';
    title = 'Puxa, não conseguimos encontrar igrejas perto de você.';
    subtitle = nearbyError;
  } else if (awaitingLocation) {
    icon = 'navigate-outline';
    title = 'Puxa, ainda não sabemos onde você está.';
    subtitle = 'Toque em "Tentar novamente" e permita o acesso à localização para ver as igrejas mais próximas de você.';
  } else if (favorites) {
    icon = 'heart-outline';
    title = 'Puxa, você ainda não favoritou nenhuma paróquia.';
    subtitle = 'Adicione igrejas aos favoritos para acessá-las rapidamente';
    action = { label: 'Ver todas as igrejas', run: () => onFilter('all') };
  }
  if (!action && filterMode === 'nearby') action = { label: 'Tentar Novamente', run: onRetryNearby };

  return <EmptyState icon={icon} message={`${title}\n${subtitle}`} actionLabel={action?.label} onAction={action?.run} />;
}
