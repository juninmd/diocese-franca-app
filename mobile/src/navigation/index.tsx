import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import type { Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackNavigationOptions } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ChurchesScreen from '../screens/ChurchesScreen';
import ChurchDetailScreen from '../screens/ChurchDetailScreen';
import PriestsScreen from '../screens/PriestsScreen';
import PriestDetailScreen from '../screens/PriestDetailScreen';
import MassesScreen from '../screens/MassesScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { NetworkStatus } from '../components/NetworkStatus';
import { colors, isDark } from '../theme';
import { SearchProvider } from '../context/SearchContext';
import type { ChurchesStackParamList, PriestsStackParamList, RootTabParamList } from './types';

export type { ChurchesStackParamList, PriestsStackParamList, RootTabParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootTabParamList>();

const ChurchesNav = createStackNavigator<ChurchesStackParamList>();
const PriestsNav = createStackNavigator<PriestsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const stackOptions: StackNavigationOptions = { headerShown: false, cardStyle: { backgroundColor: colors.bg } };

const navTheme: Theme = {
  ...(isDark ? DarkTheme : DefaultTheme),
  colors: { ...(isDark ? DarkTheme : DefaultTheme).colors, background: colors.bg, card: colors.surface, text: colors.ink, primary: colors.primary, border: colors.line },
};

function ChurchesStack() {
  return (
    <ChurchesNav.Navigator screenOptions={stackOptions}>
      <ChurchesNav.Screen name="ChurchesList" component={ChurchesScreen} options={{ title: 'Igrejas' }} />
      <ChurchesNav.Screen name="ChurchDetail" component={ChurchDetailScreen} options={{ title: 'Detalhes' }} />
    </ChurchesNav.Navigator>
  );
}

function PriestsStack() {
  return (
    <PriestsNav.Navigator screenOptions={stackOptions}>
      <PriestsNav.Screen name="PriestsList" component={PriestsScreen} options={{ title: 'Padres' }} />
      <PriestsNav.Screen name="PriestDetail" component={PriestDetailScreen} options={{ title: 'Detalhes' }} />
    </PriestsNav.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início', tabBarLabel: 'Início' }} />
      <Tab.Screen name="Churches" component={ChurchesStack} options={{ title: 'Igrejas', tabBarLabel: 'Igrejas' }} />
      <Tab.Screen name="Masses" component={MassesScreen} options={{ title: 'Horários', tabBarLabel: 'Missas' }} />
      <Tab.Screen name="Priests" component={PriestsStack} options={{ title: 'Padres', tabBarLabel: 'Padres' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NetworkStatus />
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <SearchProvider navigationRef={navigationRef}>
          <TabNavigator />
        </SearchProvider>
      </NavigationContainer>
    </View>
  );
}
