import { StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import { fonts } from './index';

// Famílias customizadas não têm "peso" variável: escolhemos o arquivo pelo fontWeight pedido.
export function withFont(style: StyleProp<TextStyle>): TextStyle {
  const { fontWeight, fontFamily, ...rest }: TextStyle = StyleSheet.flatten(style) || {};
  const weight = fontWeight === 'bold' ? 700 : parseInt(String(fontWeight || '400'), 10);
  let family: string;
  if (fontFamily === fonts.serif) {
    family = weight >= 600 ? fonts.serifBold : fonts.serif;
  } else if (weight >= 800) {
    family = fonts.sansHeavy;
  } else if (weight >= 700) {
    family = fonts.sansBold;
  } else if (weight >= 600) {
    family = fonts.sansSemi;
  } else if (weight >= 500) {
    family = fonts.sansMedium;
  } else {
    family = fonts.sans;
  }
  return { ...rest, fontFamily: family, fontWeight: 'normal' };
}
