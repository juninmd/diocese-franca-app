import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Navigation />
        <StatusBar style="light" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}