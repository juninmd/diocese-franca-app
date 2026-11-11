import { useSyncExternalStore } from 'react';

// Estado de conectividade inferido das próprias chamadas à API (sem polling).
let online = true;
const listeners = new Set<() => void>();

export const isOnline = () => online;

export function setOnline(next: boolean): void {
  if (next === online) return;
  online = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useOnline = () => useSyncExternalStore(subscribe, isOnline, isOnline);
