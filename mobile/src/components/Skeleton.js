import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

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
          backgroundColor: '#e0e0e0',
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

export function ListSkeleton({ count = 5, type = 'church' }) {
  const renderItem = () => {
    switch (type) {
      case 'priest':
        return <PriestCardSkeleton key={Math.random()} />;
      case 'mass':
        return <MassCardSkeleton key={Math.random()} />;
      default:
        return <ChurchCardSkeleton key={Math.random()} />;
    }
  };

  return (
    <View style={styles.list}>
      {[...Array(count)].map((_, i) => renderItem())}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    borderTopColor: '#f0f4f8',
  },
  massCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  massContent: {
    flex: 1,
    marginLeft: 14,
  },
  list: {
    padding: 16,
  },
});