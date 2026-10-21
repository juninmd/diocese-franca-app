import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chip } from '../ui';
import { colors, radius, TOUCH } from '../../theme';

// Busca por nome/título e filtros Todos / Favoritos.
export function PriestsFilters({ query, onQuery, showFavorites, onShowFavorites, total, favCount, loading }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder={loading ? 'Buscar...' : 'Buscar por nome ou título...'}
          placeholderTextColor={colors.muted}
          editable={!loading}
          value={query}
          onChangeText={onQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onQuery('')} style={styles.clear}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      {!loading && (
        <View style={styles.chips}>
          <Chip label={`Todos (${total})`} active={!showFavorites} onPress={() => onShowFavorites(false)} />
          <Chip label={`Favoritos (${favCount})`} active={showFavorites} onPress={() => onShowFavorites(true)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: { flex: 1, minHeight: TOUCH, fontSize: 16, color: colors.ink, outlineStyle: 'none' },
  clear: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center', marginRight: -12 },
  chips: { flexDirection: 'row', gap: 10 },
});
