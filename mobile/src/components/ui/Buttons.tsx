import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, radius } from '../../theme';
import type { IconName } from '../../types';

// Botões em 4 tons: primary (vinho), gold (sobre vinho), outline, outlineLight (sobre vinho).
export type ButtonTone = 'primary' | 'gold' | 'outline' | 'outlineLight';

const tones: Record<ButtonTone, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  gold: { bg: colors.goldLight, fg: colors.onGold, border: colors.goldLight },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  outlineLight: { bg: 'transparent', fg: colors.cream, border: 'rgba(251,244,230,0.5)' },
};

interface ButtonProps {
  label: string;
  icon?: IconName;
  tone?: ButtonTone;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, icon, tone = 'primary', onPress, style }: ButtonProps) {
  const t = tones[tone];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.btn, { backgroundColor: t.bg, borderColor: t.border }, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={t.fg} /> : null}
      <Text variant="label" style={{ color: t.fg, fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// Botão circular de ícone (48px) com rótulo de acessibilidade obrigatório.
interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  active?: boolean;
  onDark?: boolean;
  color?: string;
}

export function IconButton({ icon, label, onPress, active, onDark, color }: IconButtonProps) {
  const bg = onDark ? 'rgba(251,244,230,0.16)' : active ? colors.primary : colors.tint;
  const fg = color || (onDark ? colors.cream : active ? colors.onPrimary : colors.primary);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.icon, { backgroundColor: bg }]}
    >
      <Ionicons name={icon} size={22} color={fg} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, paddingHorizontal: 18, borderRadius: radius.md, borderWidth: 1.5 },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
