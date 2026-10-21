import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from '../ui';
import { colors, radius, fonts } from '../../theme';

// Linha de uma missa: horário em serifa, igreja + tipo e sino de lembrete.
export function MassRow({ item, isNext, reminderSet, onOpenChurch, onRemind }) {
  const church = item.church?.name;
  return (
    <View style={[styles.row, isNext && styles.rowNext]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.main}
        disabled={!item.church}
        onPress={() => onOpenChurch(item.church.id)}
      >
        <Text style={[styles.time, isNext && { color: colors.primary }]}>{item.time}</Text>
        <View style={styles.info}>
          {church ? <Text variant="label" style={styles.church}>{church}</Text> : null}
          <Text variant="caption">{item.type}{isNext ? ' · próxima' : ''}</Text>
        </View>
      </TouchableOpacity>
      <IconButton
        icon={reminderSet ? 'notifications' : 'notifications-outline'}
        active={reminderSet}
        label={`Lembrar das ${item.time}${church ? ' · ' + church : ''}`}
        onPress={() => onRemind(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingLeft: 16, paddingRight: 8, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  rowNext: { backgroundColor: '#FBEFEE', borderColor: '#E4BFC2' },
  main: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 16 },
  time: { width: 70, fontFamily: fonts.serif, fontSize: 27, fontWeight: '600', letterSpacing: -0.3, color: colors.ink },
  info: { flex: 1, minWidth: 0, gap: 3 },
  church: { fontSize: 16, lineHeight: 20 },
});
