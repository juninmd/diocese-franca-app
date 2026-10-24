import React, { useEffect } from 'react';
import { StyleSheet, View, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RawText as Text } from './ui/Text';
import { useOnline } from '../services/connection';
import { pingApi } from '../services/api';
import { colors } from '../theme';

// Faixa de aviso (no fluxo, acima da navegação, sem cobrir títulos) quando as chamadas à API falham por falta de rede (os dados em cache continuam visíveis).
// Sem polling: reavalia ao voltar para o app e ao tocar na faixa.
export function NetworkStatus() {
  const online = useOnline();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') pingApi().catch(() => {});
    });
    return () => subscription.remove();
  }, []);

  if (online) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 8 }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={18} color={colors.cream} />
      <Text style={styles.text}>Sem conexão — mostrando os dados salvos</Text>
      <Text accessibilityRole="button" onPress={() => pingApi().catch(() => {})} style={styles.retry}>Tentar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingBottom: 8, paddingHorizontal: 16, backgroundColor: colors.primaryDark,
  },
  text: { color: colors.cream, fontSize: 13, fontWeight: '600' },
  retry: { color: colors.goldLight, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline', paddingVertical: 6, paddingHorizontal: 4 },
});
