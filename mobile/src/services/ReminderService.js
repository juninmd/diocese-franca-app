import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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
