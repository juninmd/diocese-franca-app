import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
        options={{ title: 'Detalhes' }}
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
        options={{ title: 'Detalhes' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Churches') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Priests') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Masses') {
            iconName = focused ? 'time' : 'time-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f4f8',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
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
          title: 'Horários',
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