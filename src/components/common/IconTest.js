import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from './Icon';
import { Icons, getIcon } from '../utils/Icons';

// Test component to verify icons are working
const IconTest = () => {
  const testIcons = [
    'home', 'profile', 'notifications', 'news', 'bloodDrop', 'heart', 
    'emergency', 'alert', 'warning', 'add', 'edit', 'delete', 'check',
    'user', 'email', 'phone', 'location', 'time', 'donation'
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Icon Test</Text>
      
      {testIcons.map((iconKey, index) => {
        const icon = Icons[iconKey];
        if (!icon) return null;
        
        return (
          <Card key={index} style={styles.iconCard}>
            <Card.Content style={styles.iconContent}>
              <Icon {...getIcon(iconKey, 32, '#6366f1')} />
              <View style={styles.iconInfo}>
                <Text variant="titleMedium">{iconKey}</Text>
                <Text variant="bodySmall">{icon.name} ({icon.type})</Text>
              </View>
            </Card.Content>
          </Card>
        );
      })}
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
  iconCard: {
    marginBottom: 8,
    elevation: 2,
  },
  iconContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconInfo: {
    marginLeft: 16,
    flex: 1,
  },
});

export default IconTest;
