import { openExternalUrl } from '../../utils/openExternalUrl';
import { scheduleReminder } from '../../services/ReminderService';
import { everyDay, nextReminder } from '../../utils/reminderTime';
import { useToast } from '../../context/ToastContext';
import { formatNextMass } from '../../utils/massTime';
import type { ReminderInput } from '../../services/ReminderService';
import type { Church, NextMass } from '../../types';

// Ações da tela de detalhe: ligar, e-mail, mapa e lembretes (a permissão é pedida em scheduleReminder).
// `church` é null enquanto carrega; as ações só são acionadas com a igreja na tela.
type ActionChurch = Pick<Church, 'name' | 'address' | 'city' | 'state'> & { nextMass?: NextMass | null };

export function useChurchActions(church: ActionChurch | null) {
  const toast = useToast();

  const remind = async (reminder: ReminderInput, successMessage: string) => {
    const scheduled = await scheduleReminder(reminder);
    if (scheduled) toast.success(successMessage);
    else toast.error('Puxa, sem permissão de notificação não conseguimos lembrar você.');
  };

  return {
    call: (phone: string) => openExternalUrl(`tel:${phone.replace(/\D/g, '')}`, toast),
    email: (address: string) => openExternalUrl(`mailto:${address}`, toast),
    openMap: () => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(`${church?.address}, ${church?.city}, ${church?.state}`)}`, toast),
    // Próximas 9h (relógio de Franca).
    remindVisit: () => {
      const when = nextReminder(everyDay('09:00'))!;
      return remind({
        title: 'Lembrete de Visita',
        body: `Não se esqueça da sua visita à ${church?.name}!`,
        seconds: when.seconds,
      }, `Lembrete de visita configurado para ${when.label}!`);
    },
    // Avisa 30 min antes da próxima missa (mínimo de 5s).
    remindMass: () => {
      // Só é exibido quando há próxima missa (NextMassCard).
      if (!church?.nextMass) return Promise.resolve();
      return remind({
        title: 'Lembrete de Missa',
        body: `${church.name}: ${formatNextMass(church.nextMass)}`,
        seconds: Math.max(5, church.nextMass.startsInMinutes * 60 - 30 * 60),
      }, 'Lembrete de missa configurado!');
    },
  };
}
