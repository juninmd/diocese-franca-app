import React, { useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, EmptyState, Pill } from '../ui';
import { NewsCardSkeleton } from '../Skeleton';
import { colors, radius } from '../../theme';

// Foto da notícia; sem foto (ou com erro de rede) mostra um bloco neutro com ícone.
function NewsImage({ uri }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.image, styles.imageFallback]}>
        <Ionicons name="newspaper-outline" size={32} color={colors.gold} />
      </View>
    );
  }
  return <Image source={{ uri }} style={styles.image} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;
}

function NewsCard({ item, onOpen, onRemind }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="link"
        accessibilityLabel={`${item.title}${item.date ? `, ${item.date}` : ''}`}
        onPress={() => onOpen(item)}
      >
        <NewsImage uri={item.image} />
        <View style={styles.body}>
          <View style={styles.meta}>
            {item.category ? <Pill label={item.category} /> : null}
            {item.date ? <Text variant="caption" numberOfLines={1} style={styles.date}>{item.date}</Text> : null}
          </View>
          <Text variant="heading" numberOfLines={3}>{item.title}</Text>
          {item.description ? <Text variant="caption" numberOfLines={3}>{item.description}</Text> : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} accessibilityRole="button" style={styles.remind} onPress={() => onRemind(item)}>
        <Ionicons name="alarm-outline" size={16} color={colors.primary} />
        <Text variant="label" style={styles.remindText}>Lembrar de Ler (10s)</Text>
      </TouchableOpacity>
    </View>
  );
}

export function NewsCarousel({ news, loading, error, onOpen, onRemind, onRetry }) {
  return (
    <View style={styles.section}>
      <Text variant="title">Notícias da Diocese</Text>
      {loading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
          <NewsCardSkeleton /><NewsCardSkeleton /><NewsCardSkeleton />
        </ScrollView>
      ) : news.length > 0 ? (
        <FlatList
          horizontal
          data={news}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <NewsCard item={item} onOpen={onOpen} onRemind={onRemind} />}
        />
      ) : (
        <EmptyState
          icon="newspaper-outline"
          message={error ? 'Puxa, não conseguimos carregar as notícias agora. Tente novamente!' : 'Puxa, não conseguimos encontrar notícias no momento.'}
          actionLabel="Tentar Novamente"
          onAction={onRetry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  list: { gap: 12, paddingRight: 20 },
  card: { width: 270, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  image: { width: '100%', height: 130, backgroundColor: colors.sand },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 14, paddingBottom: 6, gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { flexShrink: 1 },
  remind: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14 },
  remindText: { color: colors.primary },
});
