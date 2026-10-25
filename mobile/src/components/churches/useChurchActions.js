import { openExternalUrl } from '../../utils/openExternalUrl';
import { scheduleReminder } from '../../services/ReminderService';
import { useToast } from '../../context/ToastContext';
import { formatNextMass } from '../../utils/massTime';

// Ações da tela de detalhe: ligar, e-mail, mapa e lembretes (a permissão é pedida em scheduleReminder).
export function useChurchActions(church) {
  const toast = useToast();

  const remind = async (reminder, successMessage) => {
    const scheduled = await scheduleReminder(reminder);
    if (scheduled) toast.success(successMessage);
    else toast.error('Permissão de notificação negada.');
  };

  return {
    call: (phone) => openExternalUrl(`tel:${phone.replace(/\D/g, '')}`, toast),
    email: (address) => openExternalUrl(`mailto:${address}`, toast),
    openMap: () => openExternalUrl(`https://maps.google.com/?q=${encodeURIComponent(`${church.address}, ${church.city}, ${church.state}`)}`, toast),
    remindVisit: () => remind({
      title: 'Lembrete de Visita',
      body: `Não se esqueça da sua visita à ${church.name}!`,
      seconds: 5,
    }, 'Lembrete de visita configurado!'),
    // Avisa 30 min antes da próxima missa (mínimo de 5s).
    remindMass: () => remind({
      title: 'Lembrete de Missa',
      body: `${church.name}: ${formatNextMass(church.nextMass)}`,
      seconds: Math.max(5, church.nextMass.startsInMinutes * 60 - 30 * 60),
    }, 'Lembrete de missa configurado!'),
  };
}
