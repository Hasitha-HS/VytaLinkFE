import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, Menu, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import { toMessageString } from '../utils/Helpers';
import DonorService from '../services/DonorService';

const DonorRegistrationScreen = ({ navigation }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    age: '',
    gender: 'OTHER',
    bloodType: 'O_POSITIVE',
    address: '',
    weight: ''
  });
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [bloodTypeMenuVisible, setBloodTypeMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingDonor, setIsExistingDonor] = useState(false);
  const [existingDonorId, setExistingDonorId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Check if user is already a donor and fetch their data
  useEffect(() => {
    const checkExistingDonor = async () => {
      if (!user?.email) {
        setIsInitialLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking if user is already a donor...');
        const existingDonor = await DonorService.getDonorByEmail(user.email);
        
        if (existingDonor && existingDonor.id) {
          console.log('✅ User is already a donor, loading existing data');
          setIsExistingDonor(true);
          setExistingDonorId(existingDonor.id);
          
          // Parse name into first and last name
          const nameParts = existingDonor.name ? existingDonor.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Populate form with existing data
          setFormData({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: existingDonor.phone || '',
            age: existingDonor.age ? existingDonor.age.toString() : '',
            gender: existingDonor.gender || 'OTHER',
            bloodType: existingDonor.bloodType || 'O_POSITIVE',
            address: existingDonor.address || '',
            weight: existingDonor.weight ? existingDonor.weight.toString() : ''
          });
        } else {
          console.log('ℹ️ User is not a donor yet, showing registration form');
          setIsExistingDonor(false);
        }
      } catch (error) {
        console.log('ℹ️ User is not a registered donor:', error.message);
        setIsExistingDonor(false);
      } finally {
        setIsInitialLoading(false);
      }
    };

    checkExistingDonor();
  }, [user?.email]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
        !formData.age || !formData.address) {
      return 'Please fill in all required fields';
    }
    if (isNaN(formData.age) || parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      return 'Age must be between 18 and 65';
    }
    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) < 45 || parseFloat(formData.weight) > 200)) {
      return 'Weight must be between 45 and 200 kg';
    }
    return null;
  };

  const handleSubmit = async () => {
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
      
      if (isExistingDonor) {
        // Update existing donor
        const updateData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodType: formData.bloodType,
          phone: formData.phoneNumber,
          email: user.email,
          address: formData.address,
          weight: formData.weight ? parseFloat(formData.weight) : null
        };

        const response = await DonorService.updateDonorProfile(existingDonorId, updateData);
        
        if (response) {
          // Update user context with updated donor information
          await updateUser({
            donorId: existingDonorId,
            role: 'DONOR',
            ...response
          });
          
          setSnackbarMessage('Donor details updated successfully!');
          setSnackbarVisible(true);
          
          // Navigate back after a short delay
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          setError('Failed to update donor details');
          setSnackbarMessage('Failed to update donor details');
          setSnackbarVisible(true);
        }
      } else {
        // Register new donor
        const donorData = {
          userId: user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          age: formData.age,
          gender: formData.gender,
          bloodType: formData.bloodType,
          address: formData.address,
          weight: formData.weight,
          email: user.email
        };

        const response = await DonorService.registerDonor(donorData);
        
        if (response.id) {
          // Update user context with donor information
          await updateUser({
            donorId: response.id,
            role: 'DONOR',
            ...response
          });
          
          setSnackbarMessage('Successfully registered as a donor!');
          setSnackbarVisible(true);
          
          // Navigate to thank you screen
          setTimeout(() => {
            navigation.navigate('ThankYou', { 
              donorData: {
                name: `${formData.firstName} ${formData.lastName}`,
                bloodType: formData.bloodType,
                phone: formData.phoneNumber
              }
            });
          }, 2000);
        } else {
          setError('Donor registration failed');
          setSnackbarMessage('Donor registration failed');
          setSnackbarVisible(true);
        }
      }
    } catch (error) {
      console.error('Donor operation error:', error);
      
      // Handle specific error cases with cleaner messages
      let errorMessage = 'Donor registration failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('phone number already exists')) {
          errorMessage = 'A donor with this phone number is already registered. Please use a different phone number.';
        } else if (error.message.includes('email address already exists')) {
          errorMessage = 'A donor with this email address is already registered. Please use a different email.';
        } else if (error.message.includes('Full authentication is required')) {
          errorMessage = 'Registration failed. Please try again.';
        } else if (error.message.includes('Validation failed')) {
          errorMessage = 'Please check your information and try again.';
        } else {
          // Use the original error message if it's clear and helpful
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking if user is already a donor
  if (isInitialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading donor information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {isExistingDonor ? "Update Donor Details" : "Register as Donor"}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {isExistingDonor ? "Update your donor information" : "Complete your donor profile to help save lives"}
            </Text>
            
            <View style={styles.nameRow}>
              <TextInput
                label="First Name *"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
              <TextInput
                label="Last Name *"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
              />
            </View>
            
            <TextInput
              label="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Age *"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            
            <View style={styles.dropdownContainer}>
              <Menu
                visible={genderMenuVisible}
                onDismiss={() => setGenderMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setGenderMenuVisible(true)}
                    style={styles.dropdownButton}
                  >
                    Gender: {formData.gender}
                  </Button>
                }
              >
                <Menu.Item onPress={() => { handleInputChange('gender', 'MALE'); setGenderMenuVisible(false); }} title="Male" />
                <Menu.Item onPress={() => { handleInputChange('gender', 'FEMALE'); setGenderMenuVisible(false); }} title="Female" />
                <Menu.Item onPress={() => { handleInputChange('gender', 'OTHER'); setGenderMenuVisible(false); }} title="Other" />
              </Menu>
            </View>
            
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
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'A_POSITIVE'); setBloodTypeMenuVisible(false); }} title="A+" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'A_NEGATIVE'); setBloodTypeMenuVisible(false); }} title="A-" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'B_POSITIVE'); setBloodTypeMenuVisible(false); }} title="B+" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'B_NEGATIVE'); setBloodTypeMenuVisible(false); }} title="B-" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'AB_POSITIVE'); setBloodTypeMenuVisible(false); }} title="AB+" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'AB_NEGATIVE'); setBloodTypeMenuVisible(false); }} title="AB-" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'O_POSITIVE'); setBloodTypeMenuVisible(false); }} title="O+" />
                <Menu.Item onPress={() => { handleInputChange('bloodType', 'O_NEGATIVE'); setBloodTypeMenuVisible(false); }} title="O-" />
              </Menu>
            </View>
            
            <TextInput
              label="Address *"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />
            
            <TextInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={isLoading} 
              disabled={!formData.firstName || !formData.lastName || !formData.phoneNumber || 
                       !formData.age || !formData.address}
              style={styles.registerButton}
            >
              {isExistingDonor ? "Update Donor Details" : "Register as Donor"}
            </Button>
            
            <Button 
              mode="text" 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    color: Colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    justifyContent: 'flex-start',
  },
});

export default DonorRegistrationScreen;
