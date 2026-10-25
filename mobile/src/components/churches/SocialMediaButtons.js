import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui';
import { colors } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { useToast } from '../../context/ToastContext';

export function SocialMediaButtons({ socialMedia }) {
  const toast = useToast();

  if (!socialMedia || (!socialMedia.facebook && !socialMedia.instagram && !socialMedia.youtube)) {
    return null;
  }

  const links = [
    { key: 'facebook', icon: 'logo-facebook', label: 'Facebook', url: socialMedia.facebook, color: '#1877F2' },
    { key: 'instagram', icon: 'logo-instagram', label: 'Instagram', url: socialMedia.instagram, color: '#E4405F' },
    { key: 'youtube', icon: 'logo-youtube', label: 'YouTube', url: socialMedia.youtube, color: '#FF0000' },
  ].filter((item) => Boolean(item.url));

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.header}>Redes Sociais</Text>
      <View style={styles.row}>
        {links.map((item) => (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.8}
            style={styles.button}
            onPress={() => openExternalUrl(item.url, toast)}
            accessibilityLabel={`Abrir ${item.label}`}
          >
            <Ionicons name={item.icon} size={20} color={item.color} />
            <Text variant="label" style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginTop: 4 },
  header: { fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: { fontSize: 14, color: colors.text },
});
