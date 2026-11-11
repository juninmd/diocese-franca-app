import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, TextInput, Pressable, ScrollView, Animated, Easing, Platform, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useChurches, usePriests, useMasses } from '../../hooks/useData';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { Text, FadeIn } from '../ui';
import { searchAll } from './searchIndex';
import type { SearchKind, SearchResult } from './searchIndex';
import { colors, fonts, radius, isDark, noOutline } from '../../theme';
import type { IconName } from '../../types';
import type { RootTabParamList } from '../../navigation/types';

const KIND: Record<SearchKind, { icon: IconName; label: string; bg: string; fg: string }> = {
  church: { icon: 'business', label: 'Igreja', bg: colors.greenTint, fg: colors.greenInk },
  priest: { icon: 'person', label: 'Padre', bg: isDark ? '#3A1D21' : '#F1DEDC', fg: isDark ? '#F28B95' : '#5A1421' },
  forania: { icon: 'map', label: 'Forania', bg: isDark ? '#2A2236' : '#ECE5F5', fg: isDark ? '#C2A8EE' : '#3E2A63' },
  mass: { icon: 'time', label: 'Horário', bg: isDark ? '#302818' : '#F5EBD3', fg: isDark ? '#E6C477' : '#5A4210' },
};
const HINTS = ['Catedral', 'Franca', 'Pároco', '19:00', 'Forania'];
const native = Platform.OS !== 'web';

interface SearchSheetProps {
  visible: boolean;
  onClose: () => void;
  navigationRef: NavigationContainerRefWithCurrent<RootTabParamList>;
}

export function SearchSheet({ visible, onClose, navigationRef }: SearchSheetProps) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const churches = useChurches();
  const priests = usePriests();
  const masses = useMasses();
  const [query, setQuery] = useState('');
  const y = useRef(new Animated.Value(1)).current;
  const H = Dimensions.get('window').height;

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    y.setValue(reduce ? 0 : 1);
    if (!reduce) Animated.timing(y, { toValue: 0, duration: 420, easing: Easing.bezier(0.2, 0.9, 0.25, 1), useNativeDriver: native }).start();
  }, [visible]);

  const results = useMemo(() => searchAll({ query, churches: churches.data || [], priests: priests.data || [], masses: masses.data || [] }),
    [query, churches.data, priests.data, masses.data]);

  const go = (r: SearchResult) => {
    onClose();
    const nav = navigationRef.current;
    if (!nav) return;
    if (r.kind === 'church') nav.navigate('Churches', { screen: 'ChurchDetail', params: { churchId: r.id } });
    if (r.kind === 'priest') nav.navigate('Priests', { screen: 'PriestDetail', params: { priestId: r.id } });
    if (r.kind === 'forania') nav.navigate('Churches', { screen: 'ChurchesList', params: { forania: r.forania } });
    if (r.kind === 'mass') nav.navigate('Masses', { day: r.day });
  };

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [0, H] });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar busca" />
      <Animated.View style={[styles.sheet, { top: insets.top + 48, paddingBottom: insets.bottom + 16, transform: [{ translateY }] }]}>
        <View style={styles.grabber} />
        <View style={styles.field}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Igreja, padre, cidade, forania ou horário…"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Buscar na diocese"
            style={styles.input}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {!query ? (
            <View style={styles.hints}>
              <Text variant="overline">Experimente</Text>
              <View style={styles.hintRow}>
                {HINTS.map((h) => (
                  <Pressable key={h} onPress={() => setQuery(h)} accessibilityRole="button" style={styles.hint}>
                    <Text style={styles.hintText}>{h}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : results.length === 0 ? (
            <Text variant="body" style={styles.empty}>Puxa, nada encontrado para “{query}”. Tente outro nome ou cidade.</Text>
          ) : results.map((r, i) => {
            const k = KIND[r.kind];
            return (
              <FadeIn key={r.key} index={i} distance={10}>
                <Pressable onPress={() => go(r)} accessibilityRole="button" accessibilityLabel={`${k.label}: ${r.title}`} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
                  <View style={[styles.badge, { backgroundColor: k.bg }]}><Ionicons name={k.icon} size={18} color={k.fg} /></View>
                  <View style={styles.texts}>
                    <Text variant="label" numberOfLines={1}>{r.title}</Text>
                    {r.subtitle ? <Text variant="caption" numberOfLines={1}>{r.subtitle}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </Pressable>
              </FadeIn>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,8,7,0.6)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 10, gap: 14 },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 9, backgroundColor: colors.line },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 18, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface, paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: fonts.sans, fontSize: 16, color: colors.ink, height: '100%', ...Platform.select({ web: noOutline, default: {} }) },
  list: { gap: 8, paddingBottom: 40 },
  hints: { gap: 10, paddingTop: 6 },
  hintRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.tint },
  hintText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  empty: { color: colors.muted, textAlign: 'center', paddingVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, minWidth: 0, gap: 2 },
});
