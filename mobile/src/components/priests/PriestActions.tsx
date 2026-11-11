import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pop } from '../ui/Motion';
import { colors } from '../../theme';
import type { IconName } from '../../types';

function MiniButton({ icon, label, onPress, color }: { icon: IconName; label: string; onPress: () => void; color: string }) {
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
interface PriestActionsProps {
  name: string;
  isFavorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
  onDark?: boolean;
}

export function PriestActions({ name, isFavorite, onFavorite, onShare, onDark }: PriestActionsProps) {
  const idle = onDark ? colors.creamMuted : colors.muted;
  const fav = onDark ? colors.goldLight : colors.primary;
  return (
    <View>
      <Pop trigger={isFavorite}><MiniButton
        icon={isFavorite ? 'heart' : 'heart-outline'}
        label={isFavorite ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
        color={isFavorite ? fav : idle}
        onPress={onFavorite}
      /></Pop>
      <MiniButton icon="share-outline" label={`Compartilhar ${name}`} color={idle} onPress={onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  mini: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
});
