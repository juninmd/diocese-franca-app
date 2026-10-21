import React from 'react';
import { View, FlatList, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, EmptyState } from '../ui';
import { NewsCardSkeleton } from '../Skeleton';
import { colors, radius } from '../../theme';

function NewsCard({ item, onOpen, onRemind }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={() => onOpen(item)}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text variant="heading" numberOfLines={2}>{item.title}</Text>
        {item.description ? <Text variant="caption" numberOfLines={3}>{item.description}</Text> : null}
        <TouchableOpacity activeOpacity={0.8} style={styles.remind} onPress={() => onRemind(item)}>
          <Ionicons name="alarm-outline" size={16} color={colors.primary} />
          <Text variant="label" style={styles.remindText}>Lembrar de Ler (10s)</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function NewsCarousel({ news, loading, onOpen, onRemind, onRetry }) {
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
          message="Puxa, não conseguimos encontrar notícias no momento."
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
  card: { width: 260, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  image: { width: '100%', height: 120, backgroundColor: colors.sand },
  body: { padding: 14, gap: 6 },
  remind: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  remindText: { color: colors.primary },
});
