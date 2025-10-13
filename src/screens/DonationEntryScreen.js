import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  HelperText,
  ActivityIndicator
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import DonationService from '../services/DonationService';
import DonorService from '../services/DonorService';

const DonationEntryScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [formData, setFormData] = useState({
    donorId: '',
    donationDate: '',
    bloodType: '',
    donationType: '',
    amount: '',
    location: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const donationTypes = ['Whole Blood', 'Plasma', 'Platelets', 'Double Red Cells'];

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      setLoadingDonors(true);
      const donorsData = await DonorService.getAllDonors();
      setDonors(donorsData);
    } catch (error) {
      console.error('Error loading donors:', error);
      Alert.alert('Error', 'Failed to load donors. Please try again.');
    } finally {
      setLoadingDonors(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.donorId) {
      newErrors.donorId = 'Please select a donor';
    }

    if (!formData.donationDate) {
      newErrors.donationDate = 'Donation date is required';
    }

    if (!formData.bloodType) {
      newErrors.bloodType = 'Blood type is required';
    }

    if (!formData.donationType) {
      newErrors.donationType = 'Donation type is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      
      const donationData = {
        ...formData,
        donorId: parseInt(formData.donorId),
        amount: parseFloat(formData.amount),
        enteredBy: user.id,
        enteredByName: user.username
      };

      await DonationService.createDonation(donationData);
      
      Alert.alert(
        'Success',
        'Donation record added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                donorId: '',
                donationDate: '',
                bloodType: '',
                donationType: '',
                amount: '',
                location: '',
                notes: ''
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating donation:', error);
      Alert.alert('Error', 'Failed to add donation record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName, size, color) => ({
    name: iconName,
    size,
    color,
    type: 'Ionicons'
  });

  if (loadingDonors) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading donors...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Add Donation Record
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Enter donation details for a registered donor
          </Text>
        </View>

        {/* Donor Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Donor Information
            </Text>
            
            <View style={styles.pickerContainer}>
              <Text variant="bodyMedium" style={styles.pickerLabel}>
                Select Donor *
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.donorId}
                  onValueChange={(value) => handleInputChange('donorId', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a donor..." value="" />
                  {donors.map((donor) => (
                    <Picker.Item
                      key={donor.id}
                      label={`${donor.name} (${donor.bloodType})`}
                      value={donor.id}
                    />
                  ))}
                </Picker>
              </View>
              <HelperText type="error" visible={!!errors.donorId}>
                {errors.donorId}
              </HelperText>
            </View>
          </Card.Content>
        </Card>

        {/* Donation Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Donation Details
            </Text>
            
            <TextInput
              label="Donation Date *"
              value={formData.donationDate}
              onChangeText={(value) => handleInputChange('donationDate', value)}
              error={!!errors.donationDate}
              style={styles.input}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />
            <HelperText type="error" visible={!!errors.donationDate}>
              {errors.donationDate}
            </HelperText>

            <View style={styles.pickerContainer}>
              <Text variant="bodyMedium" style={styles.pickerLabel}>
                Blood Type *
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.bloodType}
                  onValueChange={(value) => handleInputChange('bloodType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select blood type..." value="" />
                  {bloodTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
              <HelperText type="error" visible={!!errors.bloodType}>
                {errors.bloodType}
              </HelperText>
            </View>

            <View style={styles.pickerContainer}>
              <Text variant="bodyMedium" style={styles.pickerLabel}>
                Donation Type *
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.donationType}
                  onValueChange={(value) => handleInputChange('donationType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select donation type..." value="" />
                  {donationTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
              <HelperText type="error" visible={!!errors.donationType}>
                {errors.donationType}
              </HelperText>
            </View>

            <TextInput
              label="Amount (ml) *"
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              error={!!errors.amount}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g., 450"
            />
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>

            <TextInput
              label="Location *"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              error={!!errors.location}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Colombo Blood Bank"
            />
            <HelperText type="error" visible={!!errors.location}>
              {errors.location}
            </HelperText>

            <TextInput
              label="Notes (Optional)"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Any additional notes about the donation"
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            icon="check"
          >
            Add Donation Record
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerLabel: {
    color: Colors.gray[700],
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  picker: {
    height: 50,
  },
  submitContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
});

export default DonationEntryScreen;
