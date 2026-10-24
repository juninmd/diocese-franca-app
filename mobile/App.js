import React from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Newsreader_500Medium, Newsreader_600SemiBold } from '@expo-google-fonts/newsreader';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { colors } from './src/theme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import Navigation from './src/navigation';
import * as Notifications from 'expo-notifications';
import { setupRecurringReminders } from './src/services/ReminderService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_500Medium, Newsreader_600SemiBold,
    Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold,
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
        <StatusBar style="dark" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
