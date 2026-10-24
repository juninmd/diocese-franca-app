import React from 'react';
import { View } from 'react-native';
import { Text, EmptyState } from '../ui';

// Estado vazio empático: favoritos vazios, busca sem resultado ou falha de carregamento.
export function PriestsEmpty({ showFavorites, hasQuery, failed, onShowAll, onRetry }) {
  if (failed) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        message="Puxa, não conseguimos carregar os padres agora. Verifique sua conexão e tente novamente!"
        actionLabel="Tentar Novamente"
        onAction={onRetry}
      />
    );
  }
  const message = showFavorites
    ? 'Puxa, você ainda não possui padres favoritos.'
    : 'Puxa, não encontramos padres com este termo.';
  const hint = showFavorites
    ? 'Adicione padres aos favoritos para acessá-los rapidamente'
    : hasQuery ? 'Que tal tentar outra busca?' : 'Puxa, não conseguimos carregar os padres agora. Verifique sua conexão e tente novamente!';
  return (
    <View style={{ gap: 12 }}>
      <EmptyState
        icon={showFavorites ? 'heart-outline' : 'person-outline'}
        message={message}
        actionLabel={showFavorites ? 'Ver todos os padres' : undefined}
        onAction={onShowAll}
      />
      <Text variant="caption" style={{ textAlign: 'center' }}>{hint}</Text>
    </View>
  );
}
