import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diocese de Franca</Text>
        <Text style={styles.subtitle}>Bem-vindo ao aplicativo da Diocese</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Churches')}
        >
          <Text style={styles.menuIcon}>⛪</Text>
          <Text style={styles.menuTitle}>Igrejas</Text>
          <Text style={styles.menuDescription}>Conheça nossas paróquias</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Priests')}
        >
          <Text style={styles.menuIcon}>👨‍⚖️</Text>
          <Text style={styles.menuTitle}>Padres</Text>
          <Text style={styles.menuDescription}>Nossos sacerdotes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Masses')}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuTitle}>Horários de Missa</Text>
          <Text style={styles.menuDescription}>Consulte os horários</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});
