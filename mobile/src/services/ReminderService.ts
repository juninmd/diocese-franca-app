import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureNotificationPermission, CHANNEL_ID } from './permissions';

const T = Notifications.SchedulableTriggerInputTypes;

// Na web o expo-notifications não agenda: usamos timer + Notification API do navegador.
export interface ReminderInput {
  title: string;
  body: string;
  seconds: number;
  data?: Record<string, unknown>;
}

const scheduleOnWeb = ({ title, body, seconds }: Pick<ReminderInput, 'title' | 'body' | 'seconds'>) => {
  setTimeout(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, seconds * 1000);
};

// Gatilhos com `type` explícito (obrigatório no expo-notifications atual) e no canal do app.
const inSeconds = (seconds: number): Notifications.TimeIntervalTriggerInput => ({ type: T.TIME_INTERVAL, seconds: Math.max(1, seconds), channelId: CHANNEL_ID });
const daily = (hour: number, minute: number): Notifications.DailyTriggerInput => ({ type: T.DAILY, hour, minute, channelId: CHANNEL_ID });
// weekday: 1 = domingo ... 7 = sábado
const weekly = (weekday: number, hour: number, minute: number): Notifications.WeeklyTriggerInput => ({ type: T.WEEKLY, weekday, hour, minute, channelId: CHANNEL_ID });

// Agenda uma notificação local; sempre verifica a permissão antes.
// Retorna true quando o lembrete foi agendado.
export async function scheduleReminder({ title, body, seconds, data }: ReminderInput): Promise<boolean> {
  try {
    const { granted } = await ensureNotificationPermission();
    if (!granted) return false;
    if (Platform.OS === 'web') {
      scheduleOnWeb({ title, body, seconds });
      return true;
    }
    await Notifications.scheduleNotificationAsync({ content: { title, body, data, sound: true }, trigger: inSeconds(seconds) });
    return true;
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    return false;
  }
}

const ANGELUS = { title: 'Hora do Ângelus 🙏', body: 'O Anjo do Senhor anunciou a Maria...' };

// Lembretes recorrentes; cada um é agendado uma única vez (a chave fica no AsyncStorage).
// Chaves "v2": as anteriores usavam gatilho de calendário, que falha no Android.
const RECURRING_REMINDERS: { key: string; content: Notifications.NotificationContentInput; trigger: Notifications.NotificationTriggerInput }[] = [
  { key: 'reminder:v2:daily', content: { title: 'Lembrete Diário 🙏', body: 'Não se esqueça de reservar um momento para oração.' }, trigger: daily(8, 0) },
  { key: 'reminder:v2:weekend', content: { title: 'Fim de semana chegou! 🙏', body: 'Confira os horários de missa da sua paróquia.' }, trigger: weekly(7, 9, 0) },
  { key: 'reminder:v2:angelusNoon', content: ANGELUS, trigger: daily(12, 0) },
  { key: 'reminder:v2:angelusEvening', content: ANGELUS, trigger: daily(18, 0) },
];

// Na abertura do app: pede permissão (sem insistir se o usuário bloqueou) e agenda
// a boas-vindas e os lembretes recorrentes, uma vez por instalação.
export async function setupRecurringReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  const { granted } = await ensureNotificationPermission({ explain: false });
  if (!granted) return;

  // Remove agendamentos antigos (formato v1) antes de reagendar no formato novo.
  if (!(await AsyncStorage.getItem('reminder:v2:migrated'))) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem('reminder:v2:migrated', 'true');
  }

  if (!(await AsyncStorage.getItem('hasSeenWelcomeNotification'))) {
    await Notifications.scheduleNotificationAsync({ content: { title: 'Bem-vindo!', body: 'Que a paz esteja com você.' }, trigger: inSeconds(2) });
    await AsyncStorage.setItem('hasSeenWelcomeNotification', 'true');
  }
  for (const { key, content, trigger } of RECURRING_REMINDERS) {
    if (await AsyncStorage.getItem(key)) continue;
    await Notifications.scheduleNotificationAsync({ content, trigger });
    await AsyncStorage.setItem(key, 'true');
  }
}
