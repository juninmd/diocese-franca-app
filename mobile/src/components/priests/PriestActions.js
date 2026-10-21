import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

function MiniButton({ icon, label, onPress, color }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.mini}
    >
      <Ionicons name={icon} size={22} color={color} />
    </TouchableOpacity>
  );
}

// Favoritar e compartilhar, empilhados; `onDark` para uso sobre o cartão vinho.
export function PriestActions({ name, isFavorite, onFavorite, onShare, onDark }) {
  const idle = onDark ? colors.creamMuted : colors.muted;
  const fav = onDark ? colors.goldLight : colors.primary;
  return (
    <View>
      <MiniButton
        icon={isFavorite ? 'heart' : 'heart-outline'}
        label={isFavorite ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
        color={isFavorite ? fav : idle}
        onPress={onFavorite}
      />
      <MiniButton icon="share-outline" label={`Compartilhar ${name}`} color={idle} onPress={onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  mini: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
});
