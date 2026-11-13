import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FinancialProvider } from './src/context/FinancialContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initPWA } from './src/utils/pwaHelper';

export default function App() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'வெற்றி நிதி மேலாண்மை';
    }
    initPWA();
  }, []);

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
