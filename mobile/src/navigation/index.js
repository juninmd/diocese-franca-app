import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ChurchesScreen from '../screens/ChurchesScreen';
import ChurchDetailScreen from '../screens/ChurchDetailScreen';
import PriestsScreen from '../screens/PriestsScreen';
import PriestDetailScreen from '../screens/PriestDetailScreen';
import MassesScreen from '../screens/MassesScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { colors } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stackOptions = { headerShown: false, cardStyle: { backgroundColor: colors.bg } };

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, text: colors.ink, primary: colors.primary, border: colors.line },
};

function ChurchesStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ChurchesList" component={ChurchesScreen} options={{ title: 'Igrejas' }} />
      <Stack.Screen name="ChurchDetail" component={ChurchDetailScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}

function PriestsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="PriestsList" component={PriestsScreen} options={{ title: 'Padres' }} />
      <Stack.Screen name="PriestDetail" component={PriestDetailScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início', tabBarLabel: 'Início' }} />
      <Tab.Screen name="Churches" component={ChurchesStack} options={{ title: 'Igrejas', tabBarLabel: 'Igrejas' }} />
      <Tab.Screen name="Priests" component={PriestsStack} options={{ title: 'Padres', tabBarLabel: 'Padres' }} />
      <Tab.Screen name="Masses" component={MassesScreen} options={{ title: 'Horários', tabBarLabel: 'Missas' }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={navTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}
