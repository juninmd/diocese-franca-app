import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { RawText as Text } from '../components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { colors, isDark } from '../theme';
import type { IconName } from '../types';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// `undefined` só no fallback fora do provider (antes de o provider montar).
type Notify = (message: string) => number | undefined;

export interface ToastApi {
  showToast: (message: string, type?: ToastType, duration?: number) => number | undefined;
  hideToast?: (id: number) => void;
  success: Notify;
  error: Notify;
  info: Notify;
  warning: Notify;
}

const ToastContext = createContext<ToastApi | null>(null);

const TOAST_DURATION = 3000;
const TOAST_TYPES: Record<ToastType, { icon: IconName; color: string; bg: string }> = {
  success: { icon: 'checkmark-circle', color: colors.greenInk, bg: colors.greenTint },
  error: { icon: 'alert-circle', color: colors.danger, bg: isDark ? '#3A1D1D' : '#F9E3E1' },
  info: { icon: 'information-circle', color: colors.primary, bg: colors.tint },
  warning: { icon: 'warning', color: isDark ? '#E6C477' : '#7A5A16', bg: isDark ? '#302818' : '#F6EBCF' },
};

let toastHandler: ToastApi | null = null;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = TOAST_DURATION): number => {
    const id = Date.now() + Math.random();
    const toast: Toast = { id, message, type };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  // Valor estável: telas/hooks que listam `toast` como dependência não recriam callbacks a cada render.
  const value = useMemo<ToastApi>(() => ({ showToast, hideToast, success, error, info, warning }), [showToast, hideToast, success, error, info, warning]);
  toastHandler = value;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onHide }: { toast: Toast; onHide: () => void }) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, []);

  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={onHide} style={styles.toastContent}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={[styles.toastText, { color: config.color }]}>{toast.message}</Text>
        <Ionicons name="close" size={18} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg: string) => toastHandler?.success(msg),
      error: (msg: string) => toastHandler?.error(msg),
      info: (msg: string) => toastHandler?.info(msg),
      warning: (msg: string) => toastHandler?.warning(msg),
      showToast: (msg: string, type?: ToastType) => toastHandler?.showToast(msg, type),
    };
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 12,
  },
});