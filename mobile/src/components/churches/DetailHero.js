import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArchArt, IconButton } from '../ui';
import { colors } from '../../theme';

// Cabeçalho vinho com arcos dourados e botões de voltar/favoritar.
export function DetailHero({ topInset, onBack, isFavorite, onToggleFavorite }) {
  const top = topInset + 12;
  return (
    <View style={[styles.hero, { height: 230 + topInset }]}>
      <ArchArt width={165} color={colors.goldLight} stroke={1} style={styles.art} />
      <View style={[styles.left, { top }]}>
        <IconButton icon="chevron-back" label="Voltar para Igrejas" onPress={onBack} onDark />
      </View>
      {onToggleFavorite ? (
        <View style={[styles.right, { top }]}>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            label={isFavorite ? 'Remover dos favoritos' : 'Favoritar igreja'}
            onPress={onToggleFavorite}
            onDark
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primaryDark, overflow: 'hidden' },
  art: { position: 'absolute', right: 40, bottom: 0, opacity: 0.5 },
  left: { position: 'absolute', left: 16 },
  right: { position: 'absolute', right: 16 },
});
