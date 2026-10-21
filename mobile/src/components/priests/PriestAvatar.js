import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '../ui';
import { colors } from '../../theme';
import { initials, realImageUri } from './priestUtils';

// Foto real quando a API fornece; caso contrário, iniciais em serifa.
export function PriestAvatar({ name, image, size = 52, bg = colors.tint, color = colors.primary }) {
  const uri = realImageUri(image);
  const box = { width: size, height: size, borderRadius: size / 2, backgroundColor: bg };
  if (uri) return <Image source={{ uri }} style={box} accessibilityIgnoresInvertColors />;
  return (
    <View style={[box, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text variant="heading" style={{ color, fontSize: Math.round(size * 0.38), fontWeight: '600' }}>
        {initials(name)}
      </Text>
    </View>
  );
}
