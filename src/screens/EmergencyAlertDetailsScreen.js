import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, List, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import EmergencyAlertService from '../services/EmergencyAlertService';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

const EmergencyAlertDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { alertId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetchAlertDetails();
  }, [alertId]);

  const formatResponseData = (responses) => {
    if (!responses || !Array.isArray(responses)) return [];
    
    return responses.map(response => ({
      id: response.donorId || response.id,
      donorName: response.donorName || 'Unknown Donor',
      response: response.response || 'PENDING',
      timestamp: response.responseTime || 'Unknown time',
      phone: response.phone || 'Not provided'
    }));
  };

  const fetchAlertDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch alert details
      const alertData = await EmergencyAlertService.getAlertDetails(alertId);
      setAlert(alertData);
      
      // Fetch donor responses
      try {
        const responsesData = await EmergencyAlertService.getAlertResponses(alertId);
        const formattedResponses = formatResponseData(responsesData);
        setResponses(formattedResponses);
      } catch (responseError) {
        console.warn('Could not fetch responses, using empty array:', responseError);
        setResponses([]);
      }
      
    } catch (error) {
      console.error('Error fetching alert details:', error);
      Alert.alert('Error', 'Failed to load alert details');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return Colors.error;
      case 'HIGH': return '#FF6B35';
      case 'MEDIUM': return '#FFA500';
      case 'LOW': return Colors.success;
      default: return Colors.gray[500];
    }
  };

  const getResponseIcon = (response) => {
    switch (response) {
      case 'ACCEPTED': return 'checkmark-circle';
      case 'DECLINED': return 'close-circle';
      case 'PENDING': return 'time';
      default: return 'help-circle';
    }
  };

  const getResponseColor = (response) => {
    switch (response) {
      case 'ACCEPTED': return Colors.success;
      case 'DECLINED': return Colors.error;
      case 'PENDING': return Colors.warning;
      default: return Colors.gray[500];
    }
  };

  const handleCancelAlert = async () => {
    Alert.alert(
      'Cancel Alert',
      'Are you sure you want to cancel this emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await EmergencyAlertService.cancelAlert(alertId);
              Alert.alert('Success', 'Alert cancelled successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel alert');
            }
          }
        }
      ]
    );
  };

  const handleSendReminder = () => {
    Alert.alert('Send Reminder', 'Reminder sent to all pending donors');
  };

  const handleConfirmDonor = (donorId) => {
    Alert.alert('Confirm Donor', 'Donor confirmed for this emergency');
  };

  const handleCallDonor = (phone) => {
    Alert.alert('Call Donor', `Calling ${phone}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading alert details...</Text>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Alert not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  // Use responseCount from alert data if available, otherwise calculate from responses
  const getResponseCounts = () => {
    if (alert?.responseCount) {
      return {
        accepted: alert.responseCount.accepted || 0,
        declined: alert.responseCount.declined || 0,
        pending: alert.responseCount.pending || 0
      };
    }
    
    // Fallback: calculate from responses array
    return {
      accepted: responses.filter(r => r.response === 'ACCEPTED').length,
      declined: responses.filter(r => r.response === 'DECLINED').length,
      pending: responses.filter(r => r.response === 'PENDING').length
    };
  };

  const { accepted: acceptedCount, declined: declinedCount, pending: pendingCount } = getResponseCounts();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Alert Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="headlineSmall" style={styles.alertTitle}>
                {alert.bloodType?.replace('_', ' ')} Blood Needed
              </Text>
              <Chip 
                style={[styles.urgencyChip, { backgroundColor: getUrgencyColor(alert.urgency) }]}
                textStyle={styles.urgencyText}
              >
                {alert.urgency}
              </Chip>
            </View>
            <Text variant="titleMedium" style={styles.hospitalName}>
              {alert.hospital}
            </Text>
            <Text variant="bodyMedium" style={styles.patientName}>
              Patient: {alert.patientName}
            </Text>
          </Card.Content>
        </Card>

        {/* Alert Details */}
        <Card style={styles.card}>
          <Card.Title title="Alert Details" />
          <Card.Content>
            <View style={styles.detailRow}>
              <Icon {...getIcon('bloodDrop', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.detailText}>
                Blood Type: {alert.bloodType?.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon {...getIcon('heart', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.detailText}>
                Units Needed: {alert.unitsNeeded}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon {...getIcon('time', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.detailText}>
                Required By: {new Date(alert.requiredBy).toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon {...getIcon('user', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.detailText}>
                Created by: {alert.createdBy}
              </Text>
            </View>
            {alert.message && (
              <View style={styles.messageContainer}>
                <Text variant="bodyMedium" style={styles.messageText}>
                  {alert.message}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Response Summary */}
        <Card style={styles.card}>
          <Card.Title title="Donor Responses" />
          <Card.Content>
            <View style={styles.responseSummary}>
              <View style={styles.responseItem}>
                <Icon {...getIcon('checkmark-circle', 24, Colors.success)} />
                <Text variant="titleMedium" style={styles.responseCount}>
                  {acceptedCount} Accepted
                </Text>
              </View>
              <View style={styles.responseItem}>
                <Icon {...getIcon('close-circle', 24, Colors.error)} />
                <Text variant="titleMedium" style={styles.responseCount}>
                  {declinedCount} Declined
                </Text>
              </View>
              <View style={styles.responseItem}>
                <Icon {...getIcon('time', 24, Colors.warning)} />
                <Text variant="titleMedium" style={styles.responseCount}>
                  {pendingCount} Pending
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Individual Responses */}
        <Card style={styles.card}>
          <Card.Title title="Individual Responses" />
          <Card.Content>
            {responses.map((response, index) => (
              <View key={response.id}>
                <List.Item
                  title={response.donorName}
                  description={`${response.response} - ${response.timestamp}`}
                  left={(props) => (
                    <Icon 
                      {...getIcon(getResponseIcon(response.response), 24, getResponseColor(response.response))} 
                    />
                  )}
                  right={() => (
                    <View style={styles.responseActions}>
                      {response.response === 'ACCEPTED' && (
                        <>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleConfirmDonor(response.id)}
                            style={styles.actionButton}
                          >
                            Confirm
                          </Button>
                          <Button
                            mode="outlined"
                            compact
                            onPress={() => handleCallDonor(response.phone)}
                            style={styles.actionButton}
                          >
                            Call
                          </Button>
                        </>
                      )}
                    </View>
                  )}
                />
                {index < responses.length - 1 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleSendReminder}
            style={styles.actionButton}
            icon="bell"
          >
            Send Reminder
          </Button>
          <Button
            mode="contained"
            onPress={handleCancelAlert}
            style={[styles.actionButton, styles.cancelButton]}
            icon="cancel"
          >
            Cancel Alert
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
  card: {
    marginBottom: 16,
    elevation: 2,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  urgencyChip: {
    marginLeft: 8,
  },
  urgencyText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  hospitalName: {
    color: Colors.gray[700],
    marginBottom: 4,
  },
  patientName: {
    color: Colors.gray[600],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: Colors.gray[700],
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  messageText: {
    color: Colors.gray[700],
    fontStyle: 'italic',
  },
  responseSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  responseItem: {
    alignItems: 'center',
  },
  responseCount: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  responseActions: {
    flexDirection: 'row',
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
  cancelButton: {
    backgroundColor: Colors.error,
  },
});

export default EmergencyAlertDetailsScreen;