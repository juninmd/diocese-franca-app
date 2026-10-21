import * as Notifications from 'expo-notifications';

// Agenda uma notificação local; sempre verifica a permissão antes.
// Retorna true quando o lembrete foi agendado.
export async function scheduleReminder({ title, body, seconds, data }) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: { seconds },
  });
  return true;
}
