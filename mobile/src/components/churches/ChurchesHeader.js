import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Chip } from '../ui';
import { colors } from '../../theme';

// Título, busca e filtros da lista de igrejas.
export function ChurchesHeader({ count, total, favoritesCount, searchQuery, onSearch, filterMode, onFilter, loading }) {
  return (
    <View style={styles.box}>
      <View style={styles.titles}>
        <Text variant="display" accessibilityRole="header">Igrejas</Text>
        <Text variant="body" style={{ color: colors.muted }}>
          {count} {count === 1 ? 'paróquia' : 'paróquias'} · Diocese de Franca
        </Text>
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder={loading ? 'Buscar...' : 'Buscar por nome, endereço ou cidade...'}
          placeholderTextColor={colors.muted}
          editable={!loading}
          value={searchQuery}
          onChangeText={onSearch}
          accessibilityLabel="Buscar paróquia"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onSearch('')} accessibilityLabel="Limpar busca" style={styles.clear}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.chips}>
        <Chip label={`Todas (${total})`} active={filterMode === 'all'} onPress={() => onFilter('all')} />
        <Chip label={`Favoritas (${favoritesCount})`} active={filterMode === 'favorites'} onPress={() => onFilter('favorites')} />
        <Chip label="Perto de mim" active={filterMode === 'nearby'} onPress={() => onFilter('nearby')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 18, marginBottom: 18 },
  titles: { gap: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, fontSize: 16, color: colors.ink, height: '100%', outlineStyle: 'none' },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
