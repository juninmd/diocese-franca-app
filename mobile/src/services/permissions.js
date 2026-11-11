import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

export const CHANNEL_ID = 'lembretes';

// Android 8+: notificação sem canal não aparece. No Android 13+ o canal precisa existir
// ANTES do pedido de permissão, senão o sistema nem mostra o diálogo.
let channelReady = null;
export function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Lembretes de missa e oração',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E9CB8C',
    }).catch((error) => {
      channelReady = null;
      throw error;
    });
  }
  return channelReady;
}

// Quando o usuário bloqueou de vez ("não perguntar novamente"), o app não consegue mais
// abrir o diálogo do sistema: explicamos e levamos aos ajustes do app.
export function explainBlocked(kind) {
  if (Platform.OS === 'web') return;
  const what = kind === 'location' ? 'à localização' : 'às notificações';
  const why = kind === 'location'
    ? 'para encontrar as igrejas e missas mais próximas de você'
    : 'para lembrar você das missas e orações';
  Alert.alert(
    'Permissão desativada',
    `Puxa, o acesso ${what} está bloqueado. Ative nos ajustes do app ${why}.`,
    [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => Linking.openSettings().catch(() => {}) },
    ],
  );
}

// Pede permissão de notificação só quando necessário.
// Retorna { granted, blocked } — `blocked` quando só os ajustes do sistema resolvem.
export async function ensureNotificationPermission({ explain = true } = {}) {
  await ensureNotificationChannel();
  let perm = await Notifications.getPermissionsAsync();
  if (perm.granted || perm.status === 'granted') return { granted: true, blocked: false };
  if (perm.canAskAgain !== false) {
    perm = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    if (perm.granted || perm.status === 'granted') return { granted: true, blocked: false };
  }
  const blocked = perm.canAskAgain === false;
  if (blocked && explain) explainBlocked('notifications');
  return { granted: false, blocked };
}
