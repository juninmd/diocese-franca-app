import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../ui';

// Barra superior própria (o header nativo do stack é ocultado): botão voltar com safe-area.
export function DetailTopBar({ onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <IconButton icon="arrow-back" label="Voltar" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 20, paddingBottom: 8, alignItems: 'flex-start' },
});
