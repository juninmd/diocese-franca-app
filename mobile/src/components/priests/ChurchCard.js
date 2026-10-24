import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors, radius } from '../../theme';

// Paróquia do padre; o toque abre a página da paróquia.
export function ChurchCard({ church, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`Abrir ${church.name}`} style={styles.card} onPress={onPress}>
      <View style={styles.icon}>
        <Ionicons name="business-outline" size={26} color={colors.surface} />
      </View>
      <View style={styles.info}>
        <Text variant="heading">{church.name}</Text>
        {church.address && <Text variant="caption" numberOfLines={2}>{church.address}</Text>}
        {church.city && <Text variant="caption">{church.city} - {church.state}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
});
