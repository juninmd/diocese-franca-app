import { Linking } from 'react-native';
import { scheduleReminder } from '../../services/ReminderService';

const DIOCESE_PHONE = '1637111400';
const DIOCESE_EMAIL = 'contato@diocesefranca.org.br';

export const callDiocese = () => Linking.openURL(`tel:${DIOCESE_PHONE}`);
export const emailDiocese = () => Linking.openURL(`mailto:${DIOCESE_EMAIL}`);

// Lembrete de 5s com toast de sucesso/erro (sempre verifica permissão antes).
const reminderAction = (toast, { title, body, success, kind = 'success' }) => async () => {
  const ok = await scheduleReminder({ title, body, seconds: 5 });
  if (ok) toast[kind](success);
  else toast.error('Permissão para notificações negada.');
};

export function buildQuickActions({ navigation, toast }) {
  return [
    { icon: 'sunny', label: 'Missa\nDomingo', onPress: () => navigation.navigate('Masses', { day: 'Domingo' }) },
    {
      icon: 'time',
      label: 'Lembrete\nÂngelus',
      onPress: reminderAction(toast, {
        title: 'Hora do Ângelus 🙏',
        body: 'O Anjo do Senhor anunciou a Maria...',
        success: 'Lembrete do Ângelus configurado para daqui a 5 segundos.',
        kind: 'info',
      }),
    },
    {
      icon: 'notifications',
      label: 'Lembrete\nTeste (5s)',
      onPress: reminderAction(toast, {
        title: 'Teste de Lembrete',
        body: 'A paz do Senhor esteja com você!',
        success: 'Notificação agendada para daqui a 5 segundos!',
      }),
    },
    {
      icon: 'call',
      label: 'Ligar\nDiocese',
      onPress: () => { toast.success('Ligando para a Diocese...'); callDiocese(); },
    },
    { icon: 'mail', label: 'Enviar\nEmail', onPress: emailDiocese },
    {
      icon: 'alarm',
      label: 'Lembrete\nTeste 5s',
      onPress: reminderAction(toast, {
        title: 'Lembrete de Oração 🙏',
        body: 'Este é um lembrete de teste configurado para 5 segundos.',
        success: 'Lembrete agendado para daqui a 5 segundos!',
      }),
    },
    {
      icon: 'book',
      label: 'Lembrete\nBíblia',
      onPress: reminderAction(toast, {
        title: 'Lembrete Bíblia 📖',
        body: 'Não se esqueça de ler o evangelho de hoje!',
        success: 'Lembrete bíblico configurado para 5s!',
      }),
    },
  ];
}
