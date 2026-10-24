import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Na web o expo-notifications não agenda: usamos timer + Notification API do navegador.
const scheduleOnWeb = ({ title, body, seconds }) => {
  setTimeout(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, seconds * 1000);
};

// Agenda uma notificação local; sempre verifica a permissão antes.
// Retorna true quando o lembrete foi agendado.
export async function scheduleReminder({ title, body, seconds, data }) {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    if (Platform.OS === 'web') {
      scheduleOnWeb({ title, body, seconds });
      return true;
    }
    await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: { seconds } });
    return true;
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    return false;
  }
}

const ANGELUS = { title: 'Hora do Ângelus 🙏', body: 'O Anjo do Senhor anunciou a Maria...' };

// Lembretes recorrentes; cada um é agendado uma única vez (a chave fica no AsyncStorage).
const RECURRING_REMINDERS = [
  { key: 'hasScheduledDailyReminder', content: { title: 'Lembrete Diário 🙏', body: 'Não se esqueça de reservar um momento para oração.' }, trigger: { hour: 8, minute: 0, repeats: true } },
  { key: 'hasScheduledWeekendReminder', content: { title: 'Fim de semana chegou! 🙏', body: 'Confira os horários de missa da sua paróquia.' }, trigger: { weekday: 6, hour: 18, minute: 0, repeats: true } },
  { key: 'hasScheduledAngelusNoon', content: ANGELUS, trigger: { hour: 12, minute: 0, repeats: true } },
  { key: 'hasScheduledAngelusEvening', content: ANGELUS, trigger: { hour: 18, minute: 0, repeats: true } },
];

// Pede permissão e agenda a mensagem de boas-vindas e os lembretes recorrentes (uma vez por instalação).
export async function setupRecurringReminders() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  if (!(await AsyncStorage.getItem('hasSeenWelcomeNotification'))) {
    await Notifications.scheduleNotificationAsync({ content: { title: 'Bem-vindo!', body: 'Que a paz esteja com você.' }, trigger: { seconds: 2 } });
    await AsyncStorage.setItem('hasSeenWelcomeNotification', 'true');
  }
  for (const { key, content, trigger } of RECURRING_REMINDERS) {
    if (await AsyncStorage.getItem(key)) continue;
    await Notifications.scheduleNotificationAsync({ content, trigger });
    await AsyncStorage.setItem(key, 'true');
  }
}
