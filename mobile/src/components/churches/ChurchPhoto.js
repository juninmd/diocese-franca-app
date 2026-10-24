import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ArchArt } from '../ui';
import { colors } from '../../theme';

// Foto da paróquia (campo `image` da API); sem foto, carregando ou com erro de rede, mostra o arco decorativo.
export function ChurchPhoto({ uri, archWidth = 60, archColor = colors.gold, style }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  return (
    <View style={[styles.box, style]}>
      {/* O arco fica por baixo: aparece enquanto a foto carrega e quando ela não existe/falha. */}
      <ArchArt width={archWidth} color={archColor} stroke={1.5} />
      {uri && !failed ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
});
