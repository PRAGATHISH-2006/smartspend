// MainTabNavigator: Responsive Sidebar Navigation with Yellow & Red theme and Previous Details tab

import React, { useState, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../constants/theme';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExpensesScreen } from '../screens/main/ExpensesScreen';
import { FixedExpensesScreen } from '../screens/main/FixedExpensesScreen';
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { PreviousDetailsScreen } from '../screens/main/PreviousDetailsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { Sidebar } from '../components/navigation/Sidebar';
import { SidebarProvider } from '../context/SidebarContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('HomeTab');
  const navRef = useRef<any>(null);
  const rootNavigation = useNavigation<any>();

  const handleSelectTab = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'Login') {
      rootNavigation.navigate('Login');
      return;
    }
    if (navRef.current?.navigate) {
      navRef.current.navigate(tabName);
    } else {
      rootNavigation.navigate(tabName);
    }
  };

  return (
    <View style={styles.layoutContainer}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Screen Area */}
      <View style={styles.mainScreenContainer}>
        <Tab.Navigator
          initialRouteName="HomeTab"
          screenListeners={({ route, navigation }) => {
            navRef.current = navigation;
            return {
              focus: () => {
                setActiveTab(route.name);
              },
            };
          }}
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Replaced by Sidebar Navigation
          }}
        >
          <Tab.Screen name="HomeTab" component={HomeScreen} />
          <Tab.Screen name="ExpensesTab" component={ExpensesScreen} />
          <Tab.Screen name="FixedTab" component={FixedExpensesScreen} />
          <Tab.Screen name="ReportsTab" component={ReportsScreen} />
          <Tab.Screen name="PreviousDetailsTab" component={PreviousDetailsScreen} />
          <Tab.Screen name="SettingsTab" component={SettingsScreen} />
        </Tab.Navigator>
      </View>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <SidebarProvider>
      <MainTabContent />
    </SidebarProvider>
  );
};

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
  },
  mainScreenContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: THEME.colors.background,
  },
});
