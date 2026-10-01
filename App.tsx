import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FinancialProvider } from './src/context/FinancialContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FinancialProvider>
          <NotificationProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </NotificationProvider>
        </FinancialProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
