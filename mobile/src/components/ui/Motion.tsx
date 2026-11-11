import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Platform } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

const native = Platform.OS !== 'web';
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

// Entrada suave (sobe + aparece); `index` cria a cascata entre irmãos.
interface FadeInProps {
  index?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function FadeIn({ index = 0, delay = 0, distance = 16, style, children }: FadeInProps) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: 520, delay: delay + Math.min(index, 8) * 60, easing: ease, useNativeDriver: native }).start();
  }, [reduce]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

// Toque que "afunda" levemente (feedback tátil visual).
interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  scaleTo?: number;
}

export function PressableScale({ style, children, scaleTo = 0.96, ...props }: PressableScaleProps) {
  const reduce = useReduceMotion();
  const s = useRef(new Animated.Value(1)).current;
  const to = (value: number) => () => !reduce && Animated.spring(s, { toValue: value, speed: 40, bounciness: 6, useNativeDriver: native }).start();
  return (
    <Pressable accessibilityRole="button" onPressIn={to(scaleTo)} onPressOut={to(1)} {...props}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Salto elástico sempre que `trigger` muda (ex.: coração ao favoritar).
interface PopProps {
  trigger: unknown;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Pop({ trigger, children, style }: PopProps) {
  const reduce = useReduceMotion();
  const s = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduce) return;
    s.setValue(0.5);
    Animated.spring(s, { toValue: 1, speed: 14, bounciness: 18, useNativeDriver: native }).start();
  }, [trigger]);
  return <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>;
}

// Pulso contínuo (halo) para chamar atenção a algo "ao vivo".
interface PulseProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Pulse({ color, size = 12, style }: PulseProps) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return undefined;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: native }));
    loop.start();
    return () => loop.stop();
  }, [reduce]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color, opacity, transform: [{ scale }] }} />
      <Animated.View style={{ width: size, height: size, borderRadius: size, backgroundColor: color }} />
    </Animated.View>
  );
}
