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
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import CampService from '../services/CampService';

const CampDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const { campId } = route.params;

  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampDetails();
  }, [campId]);

  const loadCampDetails = async () => {
    try {
      setLoading(true);
      const campData = await CampService.getCampById(campId);
      setCamp(campData);
    } catch (error) {
      console.error('Error loading camp details:', error);
      Alert.alert('Error', 'Failed to load camp details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CampEdit', { campId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Camp',
      'Are you sure you want to delete this camp? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await CampService.deleteCamp(campId);
      Alert.alert(
        'Success',
        'Camp deleted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error deleting camp:', error);
      Alert.alert('Error', 'Failed to delete camp. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return Colors.warning;
      case 'APPROVED': return Colors.success;
      case 'REJECTED': return Colors.error;
      case 'COMPLETED': return Colors.primary;
      default: return Colors.gray[500];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getIcon = (iconName, size, color) => ({
    name: iconName,
    size,
    color,
    type: 'Ionicons'
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading camp details...
        </Text>
      </View>
    );
  }

  if (!camp) {
    return (
      <View style={styles.errorContainer}>
        <Icon {...getIcon('alert-circle-outline', 64, Colors.error)} />
        <Text variant="titleMedium" style={styles.errorTitle}>
          Camp not found
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtitle}>
          The requested camp could not be found.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const canEdit = user?.id === camp.organizerId || user?.role === 'ADMIN';
  const canDelete = user?.id === camp.organizerId || user?.role === 'ADMIN';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {camp.name}
            </Text>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(camp.status) }]}
              textStyle={{ color: getStatusColor(camp.status) }}
            >
              {camp.status}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            📍 {camp.location}
          </Text>
        </View>

        {/* Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {camp.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Schedule */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Schedule
            </Text>
            
            <View style={styles.scheduleItem}>
              <Icon {...getIcon('calendar-outline', 20, Colors.primary)} />
              <View style={styles.scheduleText}>
                <Text variant="bodyMedium" style={styles.scheduleLabel}>Start Date</Text>
                <Text variant="bodyLarge" style={styles.scheduleValue}>
                  {formatDate(camp.startDate)} at {formatTime(camp.startTime)}
                </Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <Icon {...getIcon('calendar-outline', 20, Colors.primary)} />
              <View style={styles.scheduleText}>
                <Text variant="bodyMedium" style={styles.scheduleLabel}>End Date</Text>
                <Text variant="bodyLarge" style={styles.scheduleValue}>
                  {formatDate(camp.endDate)} at {formatTime(camp.endTime)}
                </Text>
              </View>
            </View>

            {camp.expectedDonors && (
              <View style={styles.scheduleItem}>
                <Icon {...getIcon('people-outline', 20, Colors.primary)} />
                <View style={styles.scheduleText}>
                  <Text variant="bodyMedium" style={styles.scheduleLabel}>Expected Donors</Text>
                  <Text variant="bodyLarge" style={styles.scheduleValue}>
                    {camp.expectedDonors} donors
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Location */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Location
            </Text>
            
            <View style={styles.locationItem}>
              <Icon {...getIcon('location-outline', 20, Colors.primary)} />
              <View style={styles.locationText}>
                <Text variant="bodyMedium" style={styles.locationLabel}>Address</Text>
                <Text variant="bodyLarge" style={styles.locationValue}>
                  {camp.address}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Contact Information
            </Text>
            
            <View style={styles.contactItem}>
              <Icon {...getIcon('person-outline', 20, Colors.primary)} />
              <View style={styles.contactText}>
                <Text variant="bodyMedium" style={styles.contactLabel}>Contact Person</Text>
                <Text variant="bodyLarge" style={styles.contactValue}>
                  {camp.contactPerson}
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Icon {...getIcon('call-outline', 20, Colors.primary)} />
              <View style={styles.contactText}>
                <Text variant="bodyMedium" style={styles.contactLabel}>Phone</Text>
                <Text variant="bodyLarge" style={styles.contactValue}>
                  {camp.contactPhone}
                </Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <Icon {...getIcon('mail-outline', 20, Colors.primary)} />
              <View style={styles.contactText}>
                <Text variant="bodyMedium" style={styles.contactLabel}>Email</Text>
                <Text variant="bodyLarge" style={styles.contactValue}>
                  {camp.contactEmail}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Additional Information */}
        {(camp.requirements || camp.notes) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Additional Information
              </Text>
              
              {camp.requirements && (
                <View style={styles.additionalItem}>
                  <Text variant="bodyMedium" style={styles.additionalLabel}>Requirements:</Text>
                  <Text variant="bodyLarge" style={styles.additionalValue}>
                    {camp.requirements}
                  </Text>
                </View>
              )}

              {camp.notes && (
                <View style={styles.additionalItem}>
                  <Text variant="bodyMedium" style={styles.additionalLabel}>Notes:</Text>
                  <Text variant="bodyLarge" style={styles.additionalValue}>
                    {camp.notes}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        {(canEdit || canDelete) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Actions
              </Text>
              
              <View style={styles.actionButtons}>
                {canEdit && (
                  <Button
                    mode="outlined"
                    onPress={handleEdit}
                    style={styles.actionButton}
                    icon="pencil"
                  >
                    Edit Camp
                  </Button>
                )}
                
                {canDelete && (
                  <Button
                    mode="outlined"
                    onPress={handleDelete}
                    style={[styles.actionButton, { borderColor: Colors.error }]}
                    textColor={Colors.error}
                    icon="delete"
                  >
                    Delete Camp
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    marginTop: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  errorSubtitle: {
    marginTop: 8,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  statusChip: {
    marginLeft: 16,
  },
  headerSubtitle: {
    color: Colors.gray[600],
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
  description: {
    color: Colors.text.primary,
    lineHeight: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleText: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleLabel: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  scheduleValue: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  locationValue: {
    color: Colors.text.primary,
    fontWeight: '500',
    lineHeight: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  contactValue: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  additionalItem: {
    marginBottom: 16,
  },
  additionalLabel: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  additionalValue: {
    color: Colors.text.primary,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CampDetailsScreen;
