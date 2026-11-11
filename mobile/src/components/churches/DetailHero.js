import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconButton, Pop } from '../ui';
import { ChurchPhoto } from './ChurchPhoto';
import { colors } from '../../theme';

// Cabeçalho vinho com arcos dourados e botões de voltar/favoritar.
export function DetailHero({ image, topInset, onBack, isFavorite, onToggleFavorite }) {
  const top = topInset + 12;
  return (
    <View style={[styles.hero, { height: 230 + topInset }]}>
      {image ? (
        <>
          <ChurchPhoto uri={image} style={StyleSheet.absoluteFill} />
          <View style={styles.scrim} />
        </>
      ) : (
        <Svg width="100%" height="100%" viewBox="0 0 390 260" preserveAspectRatio="xMidYMax slice" style={StyleSheet.absoluteFill}>
          <Path d="M60 260V150a135 135 0 0 1 270 0v110" fill={colors.primary} opacity={0.55} />
          <Path d="M120 260V170a75 75 0 0 1 150 0v90" fill="none" stroke={colors.goldLight} strokeWidth={6} />
          <Circle cx={195} cy={120} r={22} fill="none" stroke={colors.goldLight} strokeWidth={4} />
        </Svg>
      )}
      <View style={[styles.left, { top }]}>
        <IconButton icon="chevron-back" label="Voltar para Igrejas" onPress={onBack} onDark />
      </View>
      {onToggleFavorite ? (
        <View style={[styles.right, { top }]}>
          <Pop trigger={isFavorite}>
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              label={isFavorite ? 'Remover dos favoritos' : 'Favoritar igreja'}
              onPress={onToggleFavorite}
              onDark
              color={isFavorite ? colors.goldLight : undefined}
            />
          </Pop>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.hero, overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,17,15,0.32)' },
  left: { position: 'absolute', left: 16 },
  right: { position: 'absolute', right: 16 },
});
