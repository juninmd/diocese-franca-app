import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from '../ui';

const formatToday = () =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export function HomeHeader({ onRefresh }) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text variant="overline">{formatToday()}</Text>
        <Text variant="display">A paz esteja{'\n'}com você</Text>
        <Text variant="caption">Diocese de Franca · Aplicativo Oficial</Text>
      </View>
      <IconButton icon="refresh" label="Atualizar dados" onPress={onRefresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  texts: { flex: 1, gap: 6 },
});
