import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from '../ui';
import { colors, radius } from '../../theme';
import { PriestAvatar } from './PriestAvatar';
import { PriestActions } from './PriestActions';
import { openCall } from './priestUtils';

// Cartão de pároco: avatar, nome, função e ações.
export function PriestCard({ priest, isFavorite, onOpen, onFavorite, onShare }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} style={styles.main} onPress={onOpen}>
        <PriestAvatar name={priest.name} image={priest.image} />
        <View style={styles.info}>
          <Text variant="label" style={styles.name} numberOfLines={2}>{priest.name}</Text>
          <Text variant="caption" numberOfLines={2}>{priest.title}</Text>
        </View>
      </TouchableOpacity>
      <PriestActions name={priest.name} isFavorite={isFavorite} onFavorite={onFavorite} onShare={onShare} />
      {priest.phone ? (
        <IconButton icon="call-outline" label={`Ligar para ${priest.name}`} onPress={() => openCall(priest.phone)} />
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
  name: { fontSize: 16, lineHeight: 20 },
});
