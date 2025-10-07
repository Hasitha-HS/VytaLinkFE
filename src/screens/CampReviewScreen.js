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
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import CampService from '../services/CampService';

const CampReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const { campId } = route.params;

  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

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

  const handleApprove = async () => {
    Alert.alert(
      'Approve Camp',
      'Are you sure you want to approve this camp request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => updateCampStatus('APPROVED') }
      ]
    );
  };

  const handleReject = async () => {
    Alert.alert(
      'Reject Camp',
      'Are you sure you want to reject this camp request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', onPress: () => updateCampStatus('REJECTED') }
      ]
    );
  };

  const updateCampStatus = async (status) => {
    try {
      setReviewLoading(true);
      await CampService.updateCampStatus(campId, status, user.id);
      
      Alert.alert(
        'Success',
        `Camp request ${status.toLowerCase()} successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating camp status:', error);
      Alert.alert('Error', 'Failed to update camp status. Please try again.');
    } finally {
      setReviewLoading(false);
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Review Camp Request
          </Text>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(camp.status) }]}
            textStyle={{ color: getStatusColor(camp.status) }}
          >
            {camp.status}
          </Chip>
        </View>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Camp Name:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Description:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.description}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Location:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Address:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.address}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Schedule */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Schedule
            </Text>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Start Date:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{formatDate(camp.startDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>End Date:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{formatDate(camp.endDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Start Time:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{formatTime(camp.startTime)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>End Time:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{formatTime(camp.endTime)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Expected Donors:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {camp.expectedDonors || 'Not specified'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Organizer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Organizer Information
            </Text>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Organizer:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.organizerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Contact Person:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.contactPerson}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Contact Phone:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.contactPhone}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Contact Email:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{camp.contactEmail}</Text>
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
                <>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Requirements:</Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>{camp.requirements}</Text>
                </>
              )}

              {camp.notes && (
                <>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Notes:</Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>{camp.notes}</Text>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Review Actions */}
        {camp.status === 'PENDING' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Review Actions
              </Text>
              
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={handleApprove}
                  loading={reviewLoading}
                  disabled={reviewLoading}
                  style={[styles.actionButton, { backgroundColor: Colors.success }]}
                  icon="check"
                >
                  Approve
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleReject}
                  loading={reviewLoading}
                  disabled={reviewLoading}
                  style={[styles.actionButton, { backgroundColor: Colors.error }]}
                  icon="close"
                >
                  Reject
                </Button>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
  },
  statusChip: {
    marginLeft: 16,
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: Colors.gray[700],
    width: 120,
  },
  detailValue: {
    flex: 1,
    color: Colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CampReviewScreen;
