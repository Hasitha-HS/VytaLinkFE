import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Menu, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import EmergencyAlertService from '../services/EmergencyAlertService';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

const EmergencyAlertCreationScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showBloodTypeMenu, setShowBloodTypeMenu] = useState(false);
  const [showUrgencyMenu, setShowUrgencyMenu] = useState(false);
  
  const [formData, setFormData] = useState({
    bloodType: '',
    unitsNeeded: '',
    urgency: '',
    hospital: '',
    patientName: '',
    message: '',
    requiredBy: ''
  });

  const bloodTypes = [
    'O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE',
    'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'
  ];

  const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.bloodType || !formData.unitsNeeded || !formData.urgency || 
        !formData.hospital || !formData.patientName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleCreateAlert = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const alertData = {
        bloodType: formData.bloodType,
        unitsNeeded: parseInt(formData.unitsNeeded),
        urgencyLevel: formData.urgency,
        hospitalName: formData.hospital,
        patientName: formData.patientName,
        message: formData.message,
        requiredBy: formData.requiredBy || new Date().toISOString()
      };

      await EmergencyAlertService.createAlert(alertData);
      Alert.alert('Success', 'Emergency alert created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating alert:', error);
      Alert.alert('Error', 'Failed to create emergency alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Title 
            title="Create Emergency Alert" 
            left={(props) => <Icon {...getIcon('warning', 24, Colors.primary)} />}
          />
          <Card.Content>
            {/* Blood Type Selection */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Blood Type *</Text>
              <Menu
                visible={showBloodTypeMenu}
                onDismiss={() => setShowBloodTypeMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setShowBloodTypeMenu(true)}
                    style={styles.menuButton}
                  >
                    {formData.bloodType || 'Select Blood Type'}
                  </Button>
                }
              >
                {bloodTypes.map((type) => (
                  <Menu.Item
                    key={type}
                    onPress={() => {
                      handleInputChange('bloodType', type);
                      setShowBloodTypeMenu(false);
                    }}
                    title={type.replace('_', ' ')}
                  />
                ))}
              </Menu>
            </View>

            {/* Units Needed */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Units Needed *</Text>
              <TextInput
                mode="outlined"
                value={formData.unitsNeeded}
                onChangeText={(value) => handleInputChange('unitsNeeded', value)}
                placeholder="Enter number of units"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Urgency Level */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Urgency Level *</Text>
              <Menu
                visible={showUrgencyMenu}
                onDismiss={() => setShowUrgencyMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setShowUrgencyMenu(true)}
                    style={styles.menuButton}
                  >
                    {formData.urgency || 'Select Urgency'}
                  </Button>
                }
              >
                {urgencyLevels.map((level) => (
                  <Menu.Item
                    key={level}
                    onPress={() => {
                      handleInputChange('urgency', level);
                      setShowUrgencyMenu(false);
                    }}
                    title={level}
                  />
                ))}
              </Menu>
            </View>

            {/* Hospital */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Hospital *</Text>
              <TextInput
                mode="outlined"
                value={formData.hospital}
                onChangeText={(value) => handleInputChange('hospital', value)}
                placeholder="Enter hospital name"
                style={styles.input}
              />
            </View>

            {/* Patient Name */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Patient Name *</Text>
              <TextInput
                mode="outlined"
                value={formData.patientName}
                onChangeText={(value) => handleInputChange('patientName', value)}
                placeholder="Enter patient name"
                style={styles.input}
              />
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Message</Text>
              <TextInput
                mode="outlined"
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                placeholder="Additional details about the emergency"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </View>

            {/* Required By */}
            <View style={styles.inputGroup}>
              <Text variant="bodyMedium" style={styles.label}>Required By</Text>
              <TextInput
                mode="outlined"
                value={formData.requiredBy}
                onChangeText={(value) => handleInputChange('requiredBy', value)}
                placeholder="YYYY-MM-DD HH:MM (optional)"
                style={styles.input}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateAlert}
                style={[styles.button, styles.primaryButton]}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator size="small" color={Colors.white} /> : 'Create Alert'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  input: {
    backgroundColor: Colors.white,
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
});

export default EmergencyAlertCreationScreen;