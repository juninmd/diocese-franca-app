import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme';

export function Skeleton({ width, height, borderRadius = 8, style }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 20,
          borderRadius,
          backgroundColor: colors.sand,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ChurchCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Skeleton width={56} height={56} borderRadius={14} />
        <View style={styles.content}>
          <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <View style={styles.footer}>
        <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

export function PriestCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={[styles.content, { marginLeft: 14 }]}>
        <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
}

export function MassCardSkeleton() {
  return (
    <View style={styles.massCard}>
      <Skeleton width={60} height={50} borderRadius={10} />
      <View style={styles.massContent}>
        <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={14} />
      </View>
    </View>
  );
}

export function NewsCardSkeleton() {
  return (
    <View style={styles.newsCard}>
      <Skeleton width="100%" height={140} borderRadius={0} />
      <View style={styles.newsContent}>
        <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="60%" height={14} />
      </View>
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View style={styles.detail} accessibilityLabel="Carregando" accessibilityRole="progressbar">
      <Skeleton width="80%" height={30} />
      <Skeleton width="60%" height={16} />
      <Skeleton width="45%" height={16} />
      <Skeleton height={96} borderRadius={22} style={{ marginTop: 8 }} />
      <View style={styles.tiles}>
        <Skeleton height={72} borderRadius={22} style={{ flex: 1 }} />
        <Skeleton height={72} borderRadius={22} style={{ flex: 1 }} />
        <Skeleton height={72} borderRadius={22} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const ITEMS = { priest: PriestCardSkeleton, mass: MassCardSkeleton, news: NewsCardSkeleton, church: ChurchCardSkeleton };

export function ListSkeleton({ count = 5, type = 'church' }) {
  const Item = ITEMS[type] || ChurchCardSkeleton;
  return (
    <View style={styles.list} accessibilityLabel="Carregando" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => <Item key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  massCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  massContent: {
    flex: 1,
    marginLeft: 14,
  },
  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    width: 270,
    overflow: 'hidden',
    marginRight: 16,
  },
  newsContent: {
    padding: 12,
  },
  list: {
    paddingVertical: 4,
  },
  detail: { gap: 12 },
  tiles: { flexDirection: 'row', gap: 10 },
});