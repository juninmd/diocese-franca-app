import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { colors, isDark } from './src/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import Navigation from './src/navigation';
import * as Notifications from 'expo-notifications';
import { setupRecurringReminders } from './src/services/ReminderService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_500Medium, Fraunces_600SemiBold,
    Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  React.useEffect(() => {
    // Na web o agendamento nativo não existe; ignora sem derrubar o app.
    setupRecurringReminders().catch((e) => console.warn('Notificações indisponíveis:', e.message));
  }, []);

  // Aguarda as fontes (ou o erro) para evitar troca de fonte visível.
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Navigation />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
