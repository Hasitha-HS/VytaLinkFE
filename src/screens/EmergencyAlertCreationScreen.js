import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, Menu } from 'react-native-paper';
import { Colors } from '../utils/Colors';
import { toMessageString } from '../utils/Helpers';
import EmergencyAlertService from '../services/EmergencyAlertService';

const EmergencyAlertCreationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    bloodType: 'O_POSITIVE',
    unitsNeeded: '',
    urgencyLevel: 'HIGH',
    hospitalName: '',
    patientName: '',
    message: '',
    requiredBy: ''
  });
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [bloodTypeMenuVisible, setBloodTypeMenuVisible] = useState(false);
  const [urgencyMenuVisible, setUrgencyMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.unitsNeeded || !formData.hospitalName || !formData.patientName || 
        !formData.message || !formData.requiredBy) {
      return 'Please fill in all required fields';
    }
    if (isNaN(formData.unitsNeeded) || parseInt(formData.unitsNeeded) < 1) {
      return 'Units needed must be at least 1';
    }
    return null;
  };

  const handleCreateAlert = async () => {
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSnackbarMessage(validationError);
      setSnackbarVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const alertData = {
        ...formData,
        unitsNeeded: parseInt(formData.unitsNeeded),
        requiredBy: new Date(formData.requiredBy).toISOString()
      };

      const response = await EmergencyAlertService.createAlert(alertData);
      
      if (response.id) {
        setSnackbarMessage('Emergency alert created successfully!');
        setSnackbarVisible(true);
        
        // Navigate back to home
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setError('Failed to create alert');
        setSnackbarMessage('Failed to create alert');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Alert creation error:', error);
      const msg = toMessageString(error.message) || 'Failed to create alert';
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const bloodTypes = [
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
  ];

  const urgencyLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>Create Emergency Alert</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Create an emergency blood request to notify eligible donors
            </Text>
            
            <View style={styles.dropdownContainer}>
              <Menu
                visible={bloodTypeMenuVisible}
                onDismiss={() => setBloodTypeMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setBloodTypeMenuVisible(true)}
                    style={styles.dropdownButton}
                  >
                    Blood Type: {formData.bloodType.replace('_', ' ')}
                  </Button>
                }
              >
                {bloodTypes.map(bloodType => (
                  <Menu.Item 
                    key={bloodType}
                    onPress={() => { 
                      handleInputChange('bloodType', bloodType); 
                      setBloodTypeMenuVisible(false); 
                    }} 
                    title={bloodType.replace('_', ' ')} 
                  />
                ))}
              </Menu>
            </View>

            <TextInput
              label="Units Needed *"
              value={formData.unitsNeeded}
              onChangeText={(value) => handleInputChange('unitsNeeded', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />

            <View style={styles.dropdownContainer}>
              <Menu
                visible={urgencyMenuVisible}
                onDismiss={() => setUrgencyMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setUrgencyMenuVisible(true)}
                    style={styles.dropdownButton}
                  >
                    Urgency: {urgencyLevels.find(u => u.value === formData.urgencyLevel)?.label}
                  </Button>
                }
              >
                {urgencyLevels.map(urgency => (
                  <Menu.Item 
                    key={urgency.value}
                    onPress={() => { 
                      handleInputChange('urgencyLevel', urgency.value); 
                      setUrgencyMenuVisible(false); 
                    }} 
                    title={urgency.label} 
                  />
                ))}
              </Menu>
            </View>

            <TextInput
              label="Hospital Name *"
              value={formData.hospitalName}
              onChangeText={(value) => handleInputChange('hospitalName', value)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Patient Name *"
              value={formData.patientName}
              onChangeText={(value) => handleInputChange('patientName', value)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Message *"
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Required By (Date & Time) *"
              value={formData.requiredBy}
              onChangeText={(value) => handleInputChange('requiredBy', value)}
              style={styles.input}
              mode="outlined"
              placeholder="YYYY-MM-DD HH:MM"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <Button 
              mode="contained" 
              onPress={handleCreateAlert} 
              loading={isLoading} 
              disabled={!formData.unitsNeeded || !formData.hospitalName || 
                       !formData.patientName || !formData.message || !formData.requiredBy}
              style={styles.createButton}
            >
              Create Emergency Alert
            </Button>
            
            <Button 
              mode="text" 
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </Card.Content>
        </Card>
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: Colors.gray[800] }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    minHeight: '100%',
  },
  card: {
    paddingVertical: 8,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.gray[600],
  },
  input: {
    marginBottom: 12,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    justifyContent: 'flex-start',
  },
  error: {
    color: Colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: Colors.error,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default EmergencyAlertCreationScreen;
