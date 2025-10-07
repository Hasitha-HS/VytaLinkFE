import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import MaterialIcon from './MaterialIcon';
import Icon from './Icon';
import { getIcon } from '../../utils/Icons';

// Test screen to verify Material UI icons are working
const IconTestScreen = () => {
  const testIcons = [
    'home', 'person', 'notifications', 'settings', 'add', 'edit', 'delete',
    'check', 'close', 'warning', 'error', 'info', 'refresh', 'email', 'phone',
    'location', 'time', 'bloodtype', 'favorite', 'emergency', 'alert'
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Material UI Icon Test</Text>
      
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Direct Material UI Icons</Text>
          <View style={styles.iconGrid}>
            {testIcons.slice(0, 8).map((iconName, index) => (
              <View key={index} style={styles.iconItem}>
                <MaterialIcon name={iconName} size={32} color="#6366f1" />
                <Text variant="bodySmall" style={styles.iconLabel}>{iconName}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Through Icon Component</Text>
          <View style={styles.iconGrid}>
            {testIcons.slice(8, 16).map((iconName, index) => (
              <View key={index} style={styles.iconItem}>
                <Icon {...getIcon(iconName, 32, "#6366f1")} />
                <Text variant="bodySmall" style={styles.iconLabel}>{iconName}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Tab Bar Icons</Text>
          <View style={styles.iconGrid}>
            <View style={styles.iconItem}>
              <Icon {...getIcon('tabHome', 32, "#6366f1")} />
              <Text variant="bodySmall" style={styles.iconLabel}>Home</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon {...getIcon('tabNotifications', 32, "#6366f1")} />
              <Text variant="bodySmall" style={styles.iconLabel}>Notifications</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon {...getIcon('tabProfile', 32, "#6366f1")} />
              <Text variant="bodySmall" style={styles.iconLabel}>Profile</Text>
            </View>
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

export default IconTestScreen;
