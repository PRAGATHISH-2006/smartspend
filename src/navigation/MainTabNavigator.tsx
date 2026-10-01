// MainTabNavigator: Bottom navigation with 5 tabs (Home, Expenses, Fixed, Reports, Settings)

import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Receipt, Repeat, BarChart3, Settings } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExpensesScreen } from '../screens/main/ExpensesScreen';
import { FixedExpensesScreen } from '../screens/main/FixedExpensesScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color }) => <Receipt size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="FixedTab"
        component={FixedExpensesScreen}
        options={{
          tabBarLabel: 'Fixed',
          tabBarIcon: ({ color }) => <Repeat size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => <BarChart3 size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    height: Platform.OS === 'ios' ? 88 : 76,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    ...THEME.shadows.card,
  },
  tabBarItem: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    lineHeight: 14,
    marginTop: 2,
    marginBottom: 0,
  },
});
