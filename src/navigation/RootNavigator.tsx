// RootNavigator: Routes between Auth Stack and Authenticated Main Tabs

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { LoadingState } from '../components/common/LoadingState';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingState fullScreen message="Initializing SmartSpend..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
