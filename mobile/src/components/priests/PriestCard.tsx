import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from '../ui';
import { colors, radius, avatarPalette } from '../../theme';
import { PriestAvatar } from './PriestAvatar';
import { PriestActions } from './PriestActions';
import { openCall } from './priestUtils';
import type { PriestCardProps } from './BishopCard';

// Cartão de pároco: avatar, nome, função e ações.
export function PriestCard({ priest, isFavorite, onOpen, onFavorite, onShare }: PriestCardProps) {
  const { phone } = priest;
  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${priest.name}, ${priest.title}`} style={styles.main} onPress={onOpen}>
        <View style={styles.ring}><PriestAvatar name={priest.name} image={priest.image} bg={avatarPalette[priest.id % avatarPalette.length]} color="#FFFFFF" /></View>
        <View style={styles.info}>
          <Text variant="label" style={styles.name} numberOfLines={3}>{priest.name}</Text>
          <Text variant="caption" numberOfLines={2}>{priest.title}{priest.church && priest.church.city ? ` · ${priest.church.city}` : ''}</Text>
        </View>
      </TouchableOpacity>
      <PriestActions name={priest.name} isFavorite={isFavorite} onFavorite={onFavorite} onShare={onShare} />
      {phone ? (
        <IconButton icon="call-outline" label={`Ligar para ${priest.name}`} onPress={() => openCall(phone)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  info: { flex: 1, gap: 2 },
  ring: { padding: 2, borderRadius: 30, borderWidth: 2, borderColor: colors.goldLight },
  name: { fontSize: 16, lineHeight: 20 },
});
