import { StyleSheet } from 'react-native';
import { fonts } from './index';

// Famílias customizadas não têm "peso" variável: escolhemos o arquivo pelo fontWeight pedido.
export function withFont(style) {
  const { fontWeight, fontFamily, ...rest } = StyleSheet.flatten(style) || {};
  const weight = fontWeight === 'bold' ? 700 : parseInt(fontWeight || '400', 10);
  let family;
  if (fontFamily === fonts.serif) {
    family = weight >= 600 ? fonts.serifBold : fonts.serif;
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
