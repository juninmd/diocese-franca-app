import { openExternalUrl } from '../../utils/openExternalUrl';
import { scheduleReminder } from '../../services/ReminderService';
import { everyDay, nextReminder, type ReminderSlot } from '../../utils/reminderTime';
import type { NavigationProp } from '@react-navigation/native';
import type { ToastApi, ToastType } from '../../context/ToastContext';
import type { RootTabParamList } from '../../navigation/types';
import type { QuickActionItem } from './QuickActions';

// Contato oficial da Cúria (página "Contato" de diocesefranca.org.br, id 323).
export const DIOCESE_CONTACT = {
  phone: '(16) 3721-2294',
  phoneDial: '1637212294',
  email: 'curia@diocesefranca.org.br',
  address: 'Rua Carlos de Vilhena, 3099 - Vila Chico Júlio',
  cityLine: 'Franca - SP, 14405-203',
} as const;

export const callDiocese = (toast?: ToastApi) => openExternalUrl(`tel:${DIOCESE_CONTACT.phoneDial}`, toast);
export const emailDiocese = (toast?: ToastApi) => openExternalUrl(`mailto:${DIOCESE_CONTACT.email}`, toast);

// Agenda para o próximo horário real (relógio de Franca) e confirma com toast.
interface ReminderAction {
  title: string;
  body: string;
  slots: ReminderSlot[];
  success: (label: string) => string;
  kind?: Exclude<ToastType, 'error'>;
}

const reminderAction = (toast: ToastApi, { title, body, slots, success, kind = 'success' }: ReminderAction) => async () => {
  const when = nextReminder(slots);
  if (!when) return;
  const ok = await scheduleReminder({ title, body, seconds: when.seconds });
  if (ok) toast[kind](success(when.label));
  else toast.error('Puxa, sem permissão de notificação não conseguimos lembrar você.');
};

export function buildQuickActions({ navigation, toast }: { navigation: NavigationProp<RootTabParamList>; toast: ToastApi }): QuickActionItem[] {
  return [
    { icon: 'sunny', label: 'Missa\nDomingo', onPress: () => navigation.navigate('Masses', { day: 'Domingo' }) },
    {
      icon: 'time',
      label: 'Lembrete\nÂngelus',
      onPress: reminderAction(toast, {
        title: 'Hora do Ângelus 🙏',
        body: 'O Anjo do Senhor anunciou a Maria...',
        slots: everyDay('12:00', '18:00'),
        success: (when) => `Lembrete do Ângelus configurado para ${when}.`,
        kind: 'info',
      }),
    },
    {
      icon: 'call',
      label: 'Ligar\nDiocese',
      onPress: () => { toast.success('Ligando para a Diocese...'); callDiocese(toast); },
    },
    { icon: 'mail', label: 'Enviar\nEmail', onPress: () => emailDiocese(toast) },
    {
      icon: 'book',
      label: 'Lembrete\nBíblia',
      onPress: reminderAction(toast, {
        title: 'Lembrete Bíblia 📖',
        body: 'Não se esqueça de ler o evangelho de hoje!',
        slots: everyDay('07:00'),
        success: (when) => `Lembrete bíblico configurado para ${when}.`,
      }),
    },
  ];
}
