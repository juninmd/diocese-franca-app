import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    checkConnection();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    const interval = setInterval(checkConnection, 10000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const checkConnection = async () => {
    try {
      await api.get('/', { timeout: 3000 });
      if (isOffline) {
        setIsOffline(false);
        hideIndicator();
      }
    } catch (error) {
      setIsOffline(true);
      showIndicator();
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      checkConnection();
    }
  };

  const showIndicator = () => {
    setShowIndicator(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const hideIndicator = () => {
    Animated.timing(slideAnim, {
      toValue: -60,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowIndicator(false));
  };

  if (!showIndicator) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Ionicons name="wifi-outline" size={18} color="#fff" />
      <Text style={styles.text}>
        {isOffline ? 'Sem conexão com a internet' : 'Conectado'}
      </Text>
    </Animated.View>
  );
}

export function OfflineBanner({ isOffline }) {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.bannerText}>
        Você está offline. Alguns dados podem estar desatualizados.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  banner: {
    backgroundColor: '#f39c12',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
});