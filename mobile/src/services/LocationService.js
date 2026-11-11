import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { explainBlocked } from './permissions';

// Em alguns navegadores, se o usuário nunca responder ao prompt de permissão,
// a Geolocation API do navegador não rejeita nem resolve — trava para sempre.
// Esse timeout garante que a tela sempre volte a um estado utilizável.
const PERMISSION_TIMEOUT_MS = 15000;
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

// Mensagens acolhedoras por motivo de falha (`reason` devolvido por getCurrentPosition).
export const LOCATION_MESSAGES = {
  denied: 'Puxa, permita o acesso à localização para descobrir a igreja mais próxima de você.',
  blocked: 'Puxa, o acesso à localização está bloqueado. Ative-o nos ajustes do app para ver as igrejas mais próximas.',
  services: 'Puxa, a localização do aparelho está desligada. Ative o GPS e tente novamente.',
  unavailable: 'Puxa, não conseguimos descobrir onde você está agora. Tente novamente em um lugar aberto.',
};

async function ensurePermission() {
  let perm = await Location.getForegroundPermissionsAsync();
  if (perm.status === 'granted') return 'granted';
  if (perm.canAskAgain !== false) {
    perm = await withTimeout(Location.requestForegroundPermissionsAsync(), PERMISSION_TIMEOUT_MS);
    if (perm.status === 'granted') return 'granted';
  }
  return perm.canAskAgain === false ? 'blocked' : 'denied';
}

// GPS/serviço de localização desligado: no Android pedimos para ligar (diálogo do sistema).
async function ensureServices() {
  if (Platform.OS === 'web') return true;
  if (await Location.hasServicesEnabledAsync()) return true;
  if (Platform.OS === 'android') {
    try {
      await Location.enableNetworkProviderAsync();
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      return false;
    }
  }
  return false;
}

async function readPosition() {
  try {
    return await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      PERMISSION_TIMEOUT_MS,
    );
  } catch (error) {
    // Sem sinal (ambiente fechado): a última posição recente já basta para achar a igreja.
    if (Platform.OS === 'web') throw error;
    const last = await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
    if (last) return last;
    throw error;
  }
}

/**
 * Solicita permissão de localização e retorna a posição atual do usuário.
 * Nunca lança: devolve `granted: false` e um `reason` (denied | blocked | services | unavailable)
 * para a tela explicar o que aconteceu e como resolver.
 */
export const LocationService = {
  async getCurrentPosition() {
    try {
      const permission = await ensurePermission();
      if (permission !== 'granted') {
        if (permission === 'blocked') explainBlocked('location');
        return { granted: false, coords: null, reason: permission };
      }
      if (!(await ensureServices())) return { granted: false, coords: null, reason: 'services' };

      const position = await readPosition();
      return {
        granted: true,
        coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      };
    } catch (error) {
      return { granted: false, coords: null, reason: error.message === 'timeout' ? 'denied' : 'unavailable', error: error.message };
    }
  },
};
