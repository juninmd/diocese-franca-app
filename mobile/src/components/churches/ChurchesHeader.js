import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Chip, IconButton } from '../ui';
import { colors, fonts } from '../../theme';

// Título, busca, filtros e foranias da lista de igrejas.
export function ChurchesHeader({ count, total, favoritesCount, searchQuery, onSearch, filterMode, onFilter, loading, foranias = [], forania, onForania, onOpenSearch }) {
  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <View style={styles.titles}>
          <Text variant="overline">{foranias.length ? `${foranias.length} foranias` : 'Diocese de Franca'}</Text>
          <Text variant="display" accessibilityRole="header">Igrejas</Text>
          <Text variant="body" style={{ color: colors.muted }}>
            {count} {count === 1 ? 'paróquia' : 'paróquias'} · Diocese de Franca
          </Text>
        </View>
        {onOpenSearch ? <IconButton icon="search" label="Busca universal" onPress={onOpenSearch} /> : null}
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
      {foranias.length > 0 && onForania ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foranias} style={styles.bleed}>
          <Chip label="Todas as foranias" active={!forania} onPress={() => onForania(null)} />
          {foranias.map((f) => (
            <Chip key={f} label={`Forania ${f}`} active={forania === f} onPress={() => onForania(forania === f ? null : f)} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 16, marginBottom: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titles: { flex: 1, gap: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, fontFamily: fonts.sans, fontSize: 16, color: colors.ink, height: '100%', ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }) },
  clear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bleed: { marginHorizontal: -20 },
  foranias: { gap: 8, paddingHorizontal: 20 },
});
