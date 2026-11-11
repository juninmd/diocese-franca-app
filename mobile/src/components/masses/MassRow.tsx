import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from '../ui';
import { colors, radius, fonts } from '../../theme';
import type { MassWithChurch } from '../../types';

// Linha de uma missa: horário em serifa, igreja + tipo e sino de lembrete.
interface MassRowProps {
  item: MassWithChurch;
  isNext: boolean;
  past: boolean;
  reminderSet: boolean;
  onOpenChurch: (churchId: number) => void;
  onRemind: (item: MassWithChurch) => void;
}

export function MassRow({ item, isNext, past, reminderSet, onOpenChurch, onRemind }: MassRowProps) {
  const church = item.church?.name;
  return (
    <View style={[styles.row, isNext && styles.rowNext, past && styles.past]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.main}
        disabled={!item.church}
        accessibilityRole="button"
        accessibilityLabel={`Missa às ${item.time}${church ? `, ${church}` : ''}${isNext ? ', próxima' : ''}`}
        onPress={() => { if (item.church) onOpenChurch(item.church.id); }}
      >
        <Text numberOfLines={1} style={[styles.time, isNext && { color: colors.primary }]}>{item.time}</Text>
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
  past: { opacity: 0.55 },
  rowNext: { backgroundColor: colors.tint, borderColor: colors.primary },
  main: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  time: { width: 84, flexShrink: 0, fontFamily: fonts.serif, fontSize: 26, fontWeight: '600', letterSpacing: -0.3, color: colors.ink, fontVariant: ['tabular-nums'] },
  info: { flex: 1, minWidth: 0, gap: 3 },
  church: { fontSize: 16, lineHeight: 20 },
});
