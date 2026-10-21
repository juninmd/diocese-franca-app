import React from 'react';
import { View } from 'react-native';
import { colors } from '../../theme';

// Ilustração decorativa: arcos góticos concentrados + cruz (sem dependências de SVG).
export function ArchArt({ width = 80, color = colors.gold, stroke = 1.5, style }) {
  const height = Math.round(width * 1.33);
  const arch = (w, h) => ({
    position: 'absolute',
    bottom: 0,
    left: (width - w) / 2,
    width: w,
    height: h,
    borderWidth: stroke,
    borderBottomWidth: 0,
    borderColor: color,
    borderTopLeftRadius: w / 2,
    borderTopRightRadius: w / 2,
  });
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height }, style]}
    >
      <View style={arch(width * 0.83, height * 0.82)} />
      <View style={arch(width * 0.5, height * 0.76)} />
      <View style={arch(width * 0.2, height * 0.7)} />
      <View style={{ position: 'absolute', top: 0, left: width / 2 - stroke / 2, width: stroke, height: height * 0.14, backgroundColor: color }} />
      <View style={{ position: 'absolute', top: height * 0.05, left: width / 2 - width * 0.075, width: width * 0.15, height: stroke, backgroundColor: color }} />
    </View>
  );
}
