import { useSyncExternalStore } from 'react';

// Estado de conectividade inferido das próprias chamadas à API (sem polling).
let online = true;
const listeners = new Set();

export const isOnline = () => online;

export function setOnline(next) {
  if (next === online) return;
  online = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useOnline = () => useSyncExternalStore(subscribe, isOnline, isOnline);
