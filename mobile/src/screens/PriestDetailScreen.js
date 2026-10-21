import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { getPriestById } from '../services/api';
import { scheduleReminder } from '../services/ReminderService';
import { useToast } from '../context/ToastContext';
import { Text, EmptyState } from '../components/ui';
import { DetailTopBar } from '../components/priests/DetailTopBar';
import { DetailHero } from '../components/priests/DetailHero';
import { ContactRow, Panel } from '../components/priests/ContactRow';
import { ChurchCard } from '../components/priests/ChurchCard';
import { openCall, openEmail } from '../components/priests/priestUtils';
import { colors } from '../theme';

export default function PriestDetailScreen({ route, navigation }) {
  const { priestId } = route.params;
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadPriestDetail();
  }, [priestId]);

  const loadPriestDetail = async () => {
    try {
      setLoading(true);
      setPriest(await getPriestById(priestId));
      setError(null);
    } catch (err) {
      setError('Puxa, não conseguimos carregar os detalhes do padre agora. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  const handleMap = (church) => {
    if (church && church.address) {
      const query = encodeURIComponent(`${church.name}, ${church.address}, ${church.city}`);
      Linking.openURL(`https://maps.google.com/?q=${query}`);
    }
  };

  const handleConfessionReminder = async () => {
    try {
      const scheduled = await scheduleReminder({
        title: 'Lembrete Confissão',
        body: 'Tempo para confissão com ' + priest.name,
        seconds: 5,
      });
      if (scheduled) toast.success('Lembrete configurado para daqui a 5 segundos!');
      else toast.error('Permissão de notificação negada.');
    } catch (err) {
      toast.error('Não foi possível agendar o lembrete.');
    }
  };

  const topBar = <DetailTopBar onBack={() => navigation.goBack()} />;

  if (loading) {
    return (
      <View style={styles.container}>
        {topBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="caption">Carregando...</Text>
        </View>
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
            onAction={loadPriestDetail}
          />
        </View>
      </View>
    );
  }

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
            {priest.email && (
              <ContactRow icon="mail-outline" label="Email" value={priest.email} onPress={() => openEmail(priest.email)} />
            )}
            {priest.phone && (
              <ContactRow icon="call-outline" label="Telefone" value={priest.phone} onPress={() => openCall(priest.phone)} />
            )}
            <ContactRow
              last
              icon="time-outline"
              label="Lembrete Confissão"
              value="Configurar alerta (5s)"
              trailing="notifications-outline"
              onPress={handleConfessionReminder}
            />
          </Panel>
        </View>

        {priest.church && (
          <View style={styles.section}>
            <Text variant="title">Paróquia</Text>
            <ChurchCard church={priest.church} onPress={() => handleMap(priest.church)} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  content: { paddingHorizontal: 20, paddingBottom: 110, gap: 24 },
  section: { gap: 12 },
  bio: { padding: 16 },
});
