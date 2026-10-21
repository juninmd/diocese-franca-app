import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ArchArt } from '../ui';
import { colors } from '../../theme';

// Foto da paróquia (campo `image` da API); sem foto ou com erro de rede, mostra o arco decorativo.
export function ChurchPhoto({ uri, archWidth = 60, archColor = colors.gold, style }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  return (
    <View style={[styles.box, style]}>
      {uri && !failed ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : (
        <ArchArt width={archWidth} color={archColor} stroke={1.5} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
});
