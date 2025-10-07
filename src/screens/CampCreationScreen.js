import React, { useState, useContext } from 'react';
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
  RadioButton,
  HelperText
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import CampService from '../services/CampService';

const CampCreationScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    expectedDonors: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    requirements: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Camp name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
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
      
      const campData = {
        ...formData,
        organizerId: user.id,
        organizerName: user.username,
        status: 'PENDING'
      };

      await CampService.createCamp(campData);
      
      Alert.alert(
        'Success',
        'Camp request submitted successfully! It will be reviewed by administrators.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating camp:', error);
      Alert.alert('Error', 'Failed to create camp. Please try again.');
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Create New Camp
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Fill in the details to request a blood donation camp
          </Text>
        </View>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>
            
            <TextInput
              label="Camp Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={!!errors.name}
              style={styles.input}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={!!errors.description}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>

            <TextInput
              label="Location *"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              error={!!errors.location}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Colombo, Kandy"
            />
            <HelperText type="error" visible={!!errors.location}>
              {errors.location}
            </HelperText>

            <TextInput
              label="Full Address *"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              error={!!errors.address}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
            />
            <HelperText type="error" visible={!!errors.address}>
              {errors.address}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Date and Time */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Schedule
            </Text>
            
            <View style={styles.row}>
              <TextInput
                label="Start Date *"
                value={formData.startDate}
                onChangeText={(value) => handleInputChange('startDate', value)}
                error={!!errors.startDate}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                label="End Date *"
                value={formData.endDate}
                onChangeText={(value) => handleInputChange('endDate', value)}
                error={!!errors.endDate}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
            </View>
            <HelperText type="error" visible={!!errors.startDate || !!errors.endDate}>
              {errors.startDate || errors.endDate}
            </HelperText>

            <View style={styles.row}>
              <TextInput
                label="Start Time *"
                value={formData.startTime}
                onChangeText={(value) => handleInputChange('startTime', value)}
                error={!!errors.startTime}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="HH:MM"
              />
              <TextInput
                label="End Time *"
                value={formData.endTime}
                onChangeText={(value) => handleInputChange('endTime', value)}
                error={!!errors.endTime}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="HH:MM"
              />
            </View>
            <HelperText type="error" visible={!!errors.startTime || !!errors.endTime}>
              {errors.startTime || errors.endTime}
            </HelperText>

            <TextInput
              label="Expected Number of Donors"
              value={formData.expectedDonors}
              onChangeText={(value) => handleInputChange('expectedDonors', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g., 50"
            />
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contact Information
            </Text>
            
            <TextInput
              label="Contact Person *"
              value={formData.contactPerson}
              onChangeText={(value) => handleInputChange('contactPerson', value)}
              error={!!errors.contactPerson}
              style={styles.input}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.contactPerson}>
              {errors.contactPerson}
            </HelperText>

            <TextInput
              label="Contact Phone *"
              value={formData.contactPhone}
              onChangeText={(value) => handleInputChange('contactPhone', value)}
              error={!!errors.contactPhone}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            <HelperText type="error" visible={!!errors.contactPhone}>
              {errors.contactPhone}
            </HelperText>

            <TextInput
              label="Contact Email *"
              value={formData.contactEmail}
              onChangeText={(value) => handleInputChange('contactEmail', value)}
              error={!!errors.contactEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            <HelperText type="error" visible={!!errors.contactEmail}>
              {errors.contactEmail}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>
            
            <TextInput
              label="Special Requirements"
              value={formData.requirements}
              onChangeText={(value) => handleInputChange('requirements', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Any special requirements or notes for the camp"
            />

            <TextInput
              label="Additional Notes"
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Any additional information or special instructions"
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
            Submit Camp Request
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
});

export default CampCreationScreen;
