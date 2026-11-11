import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RawText as Text } from './ui/Text';
import { PressableScale } from './ui/Motion';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { DAY_NAMES } from './masses/massUtils';
import { colors, shadow } from '../theme';
import type { IconName } from '../types';

const ICONS: Record<string, [IconName, IconName]> = {
  Home: ['home', 'home-outline'],
  Churches: ['business', 'business-outline'],
  Priests: ['people', 'people-outline'],
  Masses: ['time', 'time-outline'],
};
const FAB_SLOT = 2; // botão "Agora" fica no centro, entre Igrejas e Missas
const PILL = 60;

// Barra "noite" flutuante: pílula que desliza até a aba ativa + botão central "Agora".
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const slotOf = (i: number) => (i >= FAB_SLOT ? i + 1 : i);
  const slotW = width / (state.routes.length + 1);

  useEffect(() => {
    if (!width) return;
    const to = slotOf(state.index) * slotW + (slotW - PILL) / 2;
    if (reduce) x.setValue(to);
    else Animated.spring(x, { toValue: to, speed: 14, bounciness: 9, useNativeDriver: false }).start();
  }, [state.index, width, reduce]);

  const goNow = () => navigation.navigate('Masses', { day: DAY_NAMES[new Date().getDay()], now: Date.now() });

  const items = state.routes.map((route, index) => {
    const focused = state.index === index;
    const option = descriptors[route.key].options.tabBarLabel;
    // As abas só usam rótulos em texto (sem função de renderização).
    const label = typeof option === 'string' ? option : route.name;
    const [on, off]: [IconName, IconName] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
    const color = focused ? colors.goldLight : '#A89C8B';
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <TouchableOpacity
        key={route.key}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected: focused }}
        onPress={onPress}
        style={styles.item}
      >
        <Ionicons name={focused ? on : off} size={22} color={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </TouchableOpacity>
    );
  });

  items.splice(FAB_SLOT, 0, (
    <View key="fab" style={styles.item}>
      <PressableScale onPress={goNow} accessibilityLabel="Missas de agora" style={styles.fab}>
        <Ionicons name="flash" size={24} color={colors.onGold} />
      </PressableScale>
    </View>
  ));

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width ? <Animated.View pointerEvents="none" style={[styles.pill, { transform: [{ translateX: x }] }]} /> : null}
        {items}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: { flexDirection: 'row', height: 70, borderRadius: 26, backgroundColor: colors.tabBar, ...shadow },
  pill: { position: 'absolute', top: 9, left: 0, width: PILL, height: 52, borderRadius: 18, backgroundColor: colors.tabPill },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 11, fontWeight: '700' },
  fab: { width: 58, height: 58, marginTop: -30, borderRadius: 20, borderWidth: 4, borderColor: colors.bg, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
});
