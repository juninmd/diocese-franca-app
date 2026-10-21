import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, radius, TOUCH } from '../../theme';

// Estado vazio/erro empático. `message` deve começar com "Puxa, ...".
export function EmptyState({ icon = 'sparkles-outline', message, actionLabel, onAction }) {
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={32} color={colors.gold} />
      <Text variant="body" style={styles.message}>{message}</Text>
      {actionLabel ? (
        <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={onAction}>
          <Text variant="label" style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: 12, padding: 24, borderRadius: radius.xl, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#CDBFA8' },
  message: { textAlign: 'center', color: colors.muted },
  button: { minHeight: TOUCH, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.primary, justifyContent: 'center' },
  buttonText: { color: colors.surface },
});
