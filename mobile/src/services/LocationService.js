import * as Location from 'expo-location';

// Em alguns navegadores, se o usuário nunca responder ao prompt de permissão,
// a Geolocation API do navegador não rejeita nem resolve — trava para sempre.
// Esse timeout garante que a tela sempre volte a um estado utilizável.
const PERMISSION_TIMEOUT_MS = 15000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

/**
 * Solicita permissão de localização e retorna a posição atual do usuário.
 * Em caso de permissão negada, timeout ou falha de hardware/plataforma, retorna
 * `granted: false` para que as telas possam degradar graciosamente
 * (ex.: ocultar distância e sugerir tentar novamente) em vez de travar ou quebrar.
 */
export const LocationService = {
  async getCurrentPosition() {
    try {
      const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), PERMISSION_TIMEOUT_MS);
      if (status !== 'granted') {
        return { granted: false, coords: null };
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        PERMISSION_TIMEOUT_MS
      );

      return {
        granted: true,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
    } catch (error) {
      return { granted: false, coords: null, error: error.message };
    }
  },
};
