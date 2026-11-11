import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { usePriest } from '../hooks/useData';
import { scheduleReminder } from '../services/ReminderService';
import { everyDay, nextReminder } from '../utils/reminderTime';
import { useToast } from '../context/ToastContext';
import { Text, EmptyState } from '../components/ui';
import { DetailSkeleton } from '../components/Skeleton';
import { DetailTopBar } from '../components/priests/DetailTopBar';
import { DetailHero } from '../components/priests/DetailHero';
import { ContactRow, Panel } from '../components/priests/ContactRow';
import { ChurchCard } from '../components/priests/ChurchCard';
import { openCall, openEmail } from '../components/priests/priestUtils';
import { colors } from '../theme';
import type { PriestsStackScreenProps } from '../navigation/types';
import type { Church } from '../types';

export default function PriestDetailScreen({ route, navigation }: PriestsStackScreenProps<'PriestDetail'>) {
  const { priestId } = route.params;
  const resource = usePriest(priestId);
  const priest = resource.data;
  const error = resource.error && !priest
    ? 'Puxa, não conseguimos carregar os detalhes do padre agora. Tente novamente!'
    : null;
  const toast = useToast();

  // Abre a página da paróquia no app (lá estão "Como chegar", horários e equipe).
  const openChurch = (church: Church) => {
    if (church) navigation.navigate('Churches', { screen: 'ChurchDetail', params: { churchId: church.id } });
  };

  const handleConfessionReminder = async () => {
    try {
      // Próximas 9h (relógio de Franca): horário comercial para procurar a paróquia.
      const when = nextReminder(everyDay('09:00'))!;
      const scheduled = await scheduleReminder({
        title: 'Lembrete Confissão',
        body: 'Tempo para confissão com ' + priest?.name,
        seconds: when.seconds,
      });
      if (scheduled) toast.success(`Lembrete configurado para ${when.label}.`);
      else toast.error('Puxa, sem permissão de notificação não conseguimos lembrar você.');
    } catch (err) {
      toast.error('Não foi possível agendar o lembrete.');
    }
  };

  const topBar = <DetailTopBar onBack={() => navigation.goBack()} />;

  if (resource.loading) {
    return (
      <View style={styles.container}>
        {topBar}
        <View style={styles.pad}><DetailSkeleton /></View>
      </View>
    );
  }

  if (error || !priest) {
    return (
      <View style={styles.container}>
        {topBar}
        <View style={styles.center}>
          <EmptyState
            icon="alert-circle-outline"
            message={error || 'Puxa, não encontramos o padre'}
            actionLabel="Tentar Novamente"
            onAction={() => resource.reload()}
          />
        </View>
      </View>
    );
  }

  const { email, phone, church } = priest;
  return (
    <View style={styles.container}>
      {topBar}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DetailHero priest={priest} />

        {priest.bio && (
          <View style={styles.section}>
            <Text variant="title">Biografia</Text>
            <Panel style={styles.bio}>
              <Text variant="body" style={{ color: colors.muted }}>{priest.bio}</Text>
            </Panel>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="title">Contato</Text>
          <Panel>
            {email && (
              <ContactRow icon="mail-outline" label="Email" value={email} onPress={() => openEmail(email)} />
            )}
            {phone && (
              <ContactRow icon="call-outline" label="Telefone" value={phone} onPress={() => openCall(phone)} />
            )}
            <ContactRow
              last
              icon="time-outline"
              label="Lembrete Confissão"
              value="Configurar alerta (9h)"
              trailing="notifications-outline"
              onPress={handleConfessionReminder}
            />
          </Panel>
        </View>

        {church && (
          <View style={styles.section}>
            <Text variant="title">Paróquia</Text>
            <ChurchCard church={church} onPress={() => openChurch(church)} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 110, gap: 24 },
  section: { gap: 12 },
  bio: { padding: 16 },
});
