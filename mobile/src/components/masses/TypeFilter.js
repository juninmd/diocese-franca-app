import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Chip } from '../ui';

// Chips de filtro: "Todos os dias" (limpa o dia) + um chip por tipo de missa.
export function TypeFilter({ types, allDays, onToggleAllDays, selectedType, onSelectType }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label="Todos os dias" active={allDays} onPress={onToggleAllDays} />
      {types.length > 1 && (
        <>
          <View style={styles.gap} />
          <Chip label="Todos os tipos" active={selectedType === 'all'} onPress={() => onSelectType('all')} />
          {types.map((t) => (
            <Chip key={t} label={t} active={selectedType === t} onPress={() => onSelectType(t)} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, alignItems: 'center' },
  gap: { width: 4 },
});
