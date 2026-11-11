import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useReduceMotion } from '../../hooks/useReduceMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Anel de progresso animado (0..1) com conteúdo centralizado.
export function ProgressRing({ size = 92, stroke = 8, progress = 0, color, track, children }) {
  const reduce = useReduceMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = useRef(new Animated.Value(0)).current;
  const target = Math.max(0.04, Math.min(1, progress));
  useEffect(() => {
    if (reduce) { v.setValue(target); return; }
    Animated.timing(v, { toValue: target, duration: 1400, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: false }).start();
  }, [target, reduce]);
  const offset = v.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden={false}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={offset} rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
