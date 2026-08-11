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
      }
    }
    requestPermissionsAndWelcome();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Navigation />
        <StatusBar style="light" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}