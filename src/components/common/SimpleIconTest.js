import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Simple icon test component without complex imports
const SimpleIconTest = () => {
  const testIcons = [
    { name: 'home', type: 'MaterialIcons' },
    { name: 'person', type: 'MaterialIcons' },
    { name: 'notifications', type: 'MaterialIcons' },
    { name: 'settings', type: 'MaterialIcons' },
    { name: 'add', type: 'MaterialIcons' },
    { name: 'edit', type: 'MaterialIcons' },
    { name: 'delete', type: 'MaterialIcons' },
    { name: 'check', type: 'MaterialIcons' },
  ];

  const testIonicons = [
    { name: 'home', type: 'Ionicons' },
    { name: 'person', type: 'Ionicons' },
    { name: 'notifications', type: 'Ionicons' },
    { name: 'settings', type: 'Ionicons' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Simple Icon Test</Text>
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Material Icons</Text>
          <View style={styles.iconGrid}>
            {testIcons.map((icon, index) => (
              <View key={index} style={styles.iconItem}>
                <MaterialIcons name={icon.name} size={32} color="#6366f1" />
                <Text variant="bodySmall" style={styles.iconLabel}>{icon.name}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ionicons</Text>
          <View style={styles.iconGrid}>
            {testIonicons.map((icon, index) => (
              <View key={index} style={styles.iconItem}>
                <Ionicons name={icon.name} size={32} color="#6366f1" />
                <Text variant="bodySmall" style={styles.iconLabel}>{icon.name}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconItem: {
    alignItems: 'center',
    margin: 8,
    minWidth: 80,
  },
  iconLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default SimpleIconTest;
