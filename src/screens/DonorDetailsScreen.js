import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, List, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import DonorService from '../services/DonorService';
import DonationService from '../services/DonationService';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

const DonorDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { donorId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [donor, setDonor] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);

  useEffect(() => {
    fetchDonorDetails();
  }, [donorId]);

  const fetchDonorDetails = async () => {
    try {
      setIsLoading(true);
      const donorData = await DonorService.getDonorById(donorId);
      setDonor(donorData);
      
      // Fetch donation history
      try {
        const historyData = await DonationService.getDonationHistory(donorId);
        setDonationHistory(historyData);
      } catch (error) {
        console.log('No donation history found');
        setDonationHistory([]);
      }
    } catch (error) {
      console.error('Error fetching donor details:', error);
      Alert.alert('Error', 'Failed to load donor details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ELIGIBLE': return Colors.success;
      case 'DEFERRED': return Colors.warning;
      case 'INELIGIBLE': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ELIGIBLE': return 'checkmark-circle';
      case 'DEFERRED': return 'time';
      case 'INELIGIBLE': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const handleEditDonor = () => {
    navigation.navigate('DonorEdit', { donorId });
  };

  const handleCallDonor = () => {
    if (donor?.phone) {
      Alert.alert('Call Donor', `Calling ${donor.phone}`);
    }
  };

  const handleToggleEligibility = async () => {
    try {
      const next = donor.eligibilityStatus === 'ELIGIBLE' ? 'TEMPORARILY_DEFERRED' : 'ELIGIBLE';
      await DonorService.updateDonorStatus(donor.id, next, 'Toggled by admin');
      setDonor({ ...donor, eligibilityStatus: next });
      Alert.alert('Success', `Status set to ${next}`);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading donor details...</Text>
      </View>
    );
  }

  if (!donor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Donor not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Donor Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.donorInfo}>
                <Text variant="headlineSmall" style={styles.donorName}>
                  {donor.name || 'Unknown Donor'}
                </Text>
                <Text variant="titleMedium" style={styles.donorDetails}>
                  {donor.bloodType?.replace('_', ' ')} | Age {donor.age} | {donor.gender}
                </Text>
              </View>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(donor.eligibilityStatus) }]}
                textStyle={styles.statusText}
              >
                {donor.eligibilityStatus}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Title 
            title="Contact Information" 
            left={(props) => <Icon {...getIcon('phone', 24, Colors.primary)} />}
          />
          <Card.Content>
            <View style={styles.contactRow}>
              <Icon {...getIcon('phone', 20, Colors.gray[600])} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {donor.phone || 'Not provided'}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Icon {...getIcon('email', 20, Colors.gray[600])} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {donor.email || 'Not provided'}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Icon {...getIcon('location', 20, Colors.gray[600])} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {donor.address || 'Not provided'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Medical Information */}
        <Card style={styles.card}>
          <Card.Title 
            title="Medical Information" 
            left={(props) => <Icon {...getIcon('medicalBag', 24, Colors.primary)} />}
          />
          <Card.Content>
            <View style={styles.medicalRow}>
              <Text variant="bodyMedium" style={styles.medicalLabel}>Weight:</Text>
              <Text variant="bodyMedium" style={styles.medicalValue}>
                {donor.weight ? `${donor.weight} kg` : 'Not provided'}
              </Text>
            </View>
            <View style={styles.medicalRow}>
              <Text variant="bodyMedium" style={styles.medicalLabel}>Blood Type:</Text>
              <Text variant="bodyMedium" style={styles.medicalValue}>
                {donor.bloodType?.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.medicalRow}>
              <Text variant="bodyMedium" style={styles.medicalLabel}>Eligibility Status:</Text>
              <View style={styles.statusContainer}>
                <Icon {...getIcon(getStatusIcon(donor.eligibilityStatus), 16, getStatusColor(donor.eligibilityStatus))} />
                <Text variant="bodyMedium" style={[styles.medicalValue, { color: getStatusColor(donor.eligibilityStatus) }]}>
                  {donor.eligibilityStatus}
                </Text>
              </View>
            </View>
            <View style={styles.medicalRow}>
              <Text variant="bodyMedium" style={styles.medicalLabel}>Total Donations:</Text>
              <Text variant="bodyMedium" style={styles.medicalValue}>
                {donor.totalDonations || 0}
              </Text>
            </View>
            <View style={styles.medicalRow}>
              <Text variant="bodyMedium" style={styles.medicalLabel}>Last Donation:</Text>
              <Text variant="bodyMedium" style={styles.medicalValue}>
                {formatDate(donor.lastDonationDate)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Donation History */}
        <Card style={styles.card}>
          <Card.Title 
            title="Donation History" 
            left={(props) => <Icon {...getIcon('history', 24, Colors.primary)} />}
          />
          <Card.Content>
            {donationHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Icon {...getIcon('history', 32, Colors.gray[400])} />
                <Text variant="bodyMedium" style={styles.emptyHistoryText}>
                  No donation history found
                </Text>
              </View>
            ) : (
              donationHistory.map((donation, index) => (
                <View key={donation.id}>
                  <List.Item
                    title={donation.hospital || 'Unknown Hospital'}
                    description={
                      <View>
                        <Text variant="bodySmall" style={styles.donationDate}>
                          {formatDateTime(donation.donationDate)}
                        </Text>
                        <Text variant="bodySmall" style={styles.donationStatus}>
                          Status: {donation.status}
                        </Text>
                        {donation.notes && (
                          <Text variant="bodySmall" style={styles.donationNotes}>
                            Notes: {donation.notes}
                          </Text>
                        )}
                      </View>
                    }
                    left={(props) => (
                      <Icon {...getIcon('heart', 24, Colors.primary)} />
                    )}
                  />
                  {index < donationHistory.length - 1 && <Divider />}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleEditDonor}
            style={styles.actionButton}
            icon="pencil"
          >
            Edit Donor
          </Button>
          <Button
            mode="outlined"
            onPress={handleToggleEligibility}
            style={styles.actionButton}
            icon="shield-check"
          >
            {donor.eligibilityStatus === 'ELIGIBLE' ? 'Set Deferred' : 'Set Eligible'}
          </Button>
          <Button
            mode="outlined"
            onPress={handleCallDonor}
            style={styles.actionButton}
            icon="phone"
            disabled={!donor.phone}
          >
            Call
          </Button>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    color: Colors.error,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  donorDetails: {
    color: Colors.gray[700],
  },
  statusChip: {
    marginLeft: 16,
  },
  statusText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    color: Colors.gray[700],
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicalLabel: {
    color: Colors.gray[600],
    fontWeight: '500',
  },
  medicalValue: {
    color: Colors.gray[700],
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 32,
  },
  emptyHistoryText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
  donationDate: {
    color: Colors.gray[600],
    marginBottom: 2,
  },
  donationStatus: {
    color: Colors.gray[600],
    marginBottom: 2,
  },
  donationNotes: {
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
});

export default DonorDetailsScreen;
