import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ChurchesScreen from '../screens/ChurchesScreen';
import ChurchDetailScreen from '../screens/ChurchDetailScreen';
import PriestsScreen from '../screens/PriestsScreen';
import PriestDetailScreen from '../screens/PriestDetailScreen';
import MassesScreen from '../screens/MassesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ChurchesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ChurchesList" 
        component={ChurchesScreen}
        options={{ title: 'Igrejas' }}
      />
      <Stack.Screen 
        name="ChurchDetail" 
        component={ChurchDetailScreen}
        options={{ title: 'Detalhes da Igreja' }}
      />
    </Stack.Navigator>
  );
}

function PriestsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="PriestsList" 
        component={PriestsScreen}
        options={{ title: 'Padres' }}
      />
      <Stack.Screen 
        name="PriestDetail" 
        component={PriestDetailScreen}
        options={{ title: 'Detalhes do Padre' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#7f8c8d',
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen 
        name="Churches" 
        component={ChurchesStack}
        options={{
          title: 'Igrejas',
          tabBarLabel: 'Igrejas',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Priests" 
        component={PriestsStack}
        options={{
          title: 'Padres',
          tabBarLabel: 'Padres',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Masses" 
        component={MassesScreen}
        options={{
          title: 'Horários de Missa',
          tabBarLabel: 'Missas',
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
