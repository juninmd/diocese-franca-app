import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, ArchArt, Pill, IconButton } from '../ui';
import { colors, radius } from '../../theme';
import { formatNextMass, formatDistance } from '../../utils/massTime';

// Cartão de igreja da lista: miniatura em arco, nome em serifa, etiquetas de distância e próxima missa.
export function ChurchCard({ church, isFavorite, onPress, onToggleFavorite, onShare }) {
  const distance = formatDistance(church.distanceKm);
  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
        <View style={styles.thumb}>
          <ArchArt width={60} stroke={1.5} />
        </View>
        <View style={styles.body}>
          <View style={styles.top}>
            <Text variant="heading" numberOfLines={3}>{church.name}</Text>
            <Text variant="caption" numberOfLines={2}>{church.address}</Text>
          </View>
          <View style={styles.pills}>
            {distance ? <Pill tone="sand" label={distance} /> : null}
            {church.nextMass ? <Pill label={`Próxima missa: ${formatNextMass(church.nextMass)}`} /> : null}
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          label={`${isFavorite ? 'Remover dos favoritos' : 'Favoritar'}: ${church.name}`}
          onPress={onToggleFavorite}
          active={isFavorite}
        />
        <IconButton icon="share-outline" label={`Compartilhar: ${church.name}`} onPress={onShare} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  card: { flexDirection: 'row', gap: 14, padding: 12, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  thumb: { width: 84, minHeight: 108, borderRadius: radius.md, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  body: { flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 8 },
  top: { gap: 4, paddingRight: 52 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actions: { position: 'absolute', top: 6, right: 6, gap: 4 },
});
