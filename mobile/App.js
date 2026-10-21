import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import Navigation from './src/navigation';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  React.useEffect(() => {
    async function requestPermissionsAndWelcome() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcomeNotification');
        if (!hasSeenWelcome) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Bem-vindo!',
              body: 'Que a paz esteja com você.',
            },
            trigger: { seconds: 2 },
          });
          await AsyncStorage.setItem('hasSeenWelcomeNotification', 'true');
        }

        // Schedule daily reminder
        const hasScheduledDaily = await AsyncStorage.getItem('hasScheduledDailyReminder');
        if (!hasScheduledDaily) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Lembrete Diário 🙏',
              body: 'Não se esqueça de reservar um momento para oração.',
            },
            trigger: {
              hour: 8,
              minute: 0,
              repeats: true,
            },
          });
          await AsyncStorage.setItem('hasScheduledDailyReminder', 'true');
        }

        // Schedule weekend reminder
        const hasScheduledWeekend = await AsyncStorage.getItem('hasScheduledWeekendReminder');
        if (!hasScheduledWeekend) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Fim de semana chegou! 🙏',
              body: 'Confira os horários de missa da sua paróquia.',
            },
            trigger: {
              weekday: 6,
              hour: 18,
              minute: 0,
              repeats: true,
            },
          });
          await AsyncStorage.setItem('hasScheduledWeekendReminder', 'true');
        }

        // Schedule Angelus noon reminder
        const hasScheduledAngelusNoon = await AsyncStorage.getItem('hasScheduledAngelusNoon');
        if (!hasScheduledAngelusNoon) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Hora do Ângelus 🙏',
              body: 'O Anjo do Senhor anunciou a Maria...',
            },
            trigger: {
              hour: 12,
              minute: 0,
              repeats: true,
            },
          });
          await AsyncStorage.setItem('hasScheduledAngelusNoon', 'true');
        }

        // Schedule Angelus evening reminder
        const hasScheduledAngelusEvening = await AsyncStorage.getItem('hasScheduledAngelusEvening');
        if (!hasScheduledAngelusEvening) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Hora do Ângelus 🙏',
              body: 'O Anjo do Senhor anunciou a Maria...',
            },
            trigger: {
              hour: 18,
              minute: 0,
              repeats: true,
            },
          });
          await AsyncStorage.setItem('hasScheduledAngelusEvening', 'true');
        }
      }
    }
    // Na web o agendamento nativo não existe; ignora sem derrubar o app.
    requestPermissionsAndWelcome().catch((e) => console.warn('Notificações indisponíveis:', e.message));
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Navigation />
        <StatusBar style="dark" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}