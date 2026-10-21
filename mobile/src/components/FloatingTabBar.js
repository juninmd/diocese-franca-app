import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '../theme';

const ICONS = {
  Home: ['home', 'home-outline'],
  Churches: ['business', 'business-outline'],
  Priests: ['people', 'people-outline'],
  Masses: ['time', 'time-outline'],
};

// Tab bar flutuante com rótulo em todos os itens e destaque em pílula.
export function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key].options.tabBarLabel ?? route.name;
          const [on, off] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          const color = focused ? colors.primary : colors.muted;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Ionicons name={focused ? on : off} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14 },
  bar: { flexDirection: 'row', gap: 4, padding: 6, height: 68, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, ...shadow },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: radius.lg - 2 },
  itemActive: { backgroundColor: colors.tint },
  label: { fontSize: 12, fontWeight: '600' },
});
