import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, Avatar, List, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/Colors';
import { formatBloodType } from '../utils/Constants';
import EmergencyAlertService from '../services/EmergencyAlertService';

const EmergencyAlertDetailsScreen = ({ navigation, route }) => {
  const { alertId } = route.params;
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadAlertDetails();
  }, [alertId]);

  const loadAlertDetails = async () => {
    try {
      setLoading(true);
      const response = await EmergencyAlertService.getAlertById(alertId);
      setAlert(response);
    } catch (error) {
      console.error('Error loading alert details:', error);
      showSnackbar('Failed to load alert details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlertDetails();
    setRefreshing(false);
  };

  const handleRespond = async (response) => {
    try {
      await EmergencyAlertService.respondToAlert(alertId, 1, response); // TODO: Get actual donor ID
      showSnackbar(`Response "${response}" submitted successfully!`);
      await loadAlertDetails();
    } catch (error) {
      console.error('Error responding to alert:', error);
      showSnackbar('Failed to submit response');
    }
  };

  const handleCancelAlert = async () => {
    try {
      await EmergencyAlertService.cancelAlert(alertId);
      showSnackbar('Alert cancelled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error cancelling alert:', error);
      showSnackbar('Failed to cancel alert');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'LOW': return Colors.success;
      case 'MEDIUM': return Colors.warning;
      case 'HIGH': return Colors.error;
      case 'CRITICAL': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return Colors.primary;
      case 'FULFILLED': return Colors.success;
      case 'CANCELLED': return Colors.gray[500];
      case 'EXPIRED': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading alert details...</Text>
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text>Alert not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Alert Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Avatar.Icon
              size={60}
              icon="water"
              style={{ backgroundColor: getUrgencyColor(alert.urgencyLevel) }}
            />
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.alertTitle}>
                {formatBloodType(alert.bloodType)} Blood Needed
              </Text>
              <Text variant="titleMedium" style={styles.hospitalName}>
                {alert.hospitalName}
              </Text>
              <View style={styles.chipContainer}>
                <Chip 
                  style={[styles.chip, { backgroundColor: getUrgencyColor(alert.urgencyLevel) }]}
                  textStyle={{ color: Colors.white }}
                >
                  {alert.urgencyLevel}
                </Chip>
                <Chip 
                  style={[styles.chip, { backgroundColor: getStatusColor(alert.status) }]}
                  textStyle={{ color: Colors.white }}
                >
                  {alert.status}
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Alert Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Alert Details</Text>
          
          <List.Item
            title="Patient Name"
            description={alert.patientName}
            left={(props) => <List.Icon icon="account" />}
          />
          
          <List.Item
            title="Units Needed"
            description={alert.unitsNeeded.toString()}
            left={(props) => <List.Icon icon="water" />}
          />
          
          <List.Item
            title="Required By"
            description={new Date(alert.requiredBy).toLocaleString()}
            left={(props) => <List.Icon icon="clock" />}
          />
          
          <List.Item
            title="Message"
            description={alert.message}
            left={(props) => <List.Icon icon="message" />}
          />
          
          <List.Item
            title="Created By"
            description={alert.createdBy}
            left={(props) => <List.Icon icon="account-circle" />}
          />
          
          <List.Item
            title="Created At"
            description={new Date(alert.createdAt).toLocaleString()}
            left={(props) => <List.Icon icon="calendar" />}
          />
        </Card.Content>
      </Card>

      {/* Response Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Response Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: Colors.success }]}>
                {alert.responseCount?.accepted || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Accepted</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: Colors.error }]}>
                {alert.responseCount?.declined || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Declined</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: Colors.gray[600] }]}>
                {alert.responseCount?.pending || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Donor Responses */}
      {alert.responses && alert.responses.length > 0 && (
        <Card style={styles.responsesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Donor Responses</Text>
            
            {alert.responses.map((response, index) => (
              <List.Item
                key={index}
                title={response.donorName}
                description={`${response.response} - ${new Date(response.responseTime).toLocaleString()}`}
                left={(props) => (
                  <Avatar.Icon
                    size={40}
                    icon="account"
                    style={{ 
                      backgroundColor: response.response === 'ACCEPTED' ? Colors.success : Colors.gray[500] 
                    }}
                  />
                )}
                right={(props) => (
                  <Chip 
                    style={[
                      styles.responseChip, 
                      { 
                        backgroundColor: response.response === 'ACCEPTED' ? Colors.success : Colors.gray[500] 
                      }
                    ]}
                    textStyle={{ color: Colors.white }}
                  >
                    {response.response}
                  </Chip>
                )}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleRespond('ACCEPTED')}
              style={[styles.actionButton, { backgroundColor: Colors.success }]}
              icon="check"
            >
              Accept
            </Button>
            
            <Button
              mode="contained"
              onPress={() => handleRespond('DECLINED')}
              style={[styles.actionButton, { backgroundColor: Colors.error }]}
              icon="close"
            >
              Decline
            </Button>
          </View>
          
          {alert.status === 'ACTIVE' && (
            <Button
              mode="outlined"
              onPress={handleCancelAlert}
              style={styles.cancelButton}
              icon="cancel"
            >
              Cancel Alert
            </Button>
          )}
        </Card.Content>
      </Card>

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  alertTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hospitalName: {
    color: Colors.gray[600],
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  detailsCard: {
    margin: 16,
    marginTop: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
  },
  responsesCard: {
    margin: 16,
    marginTop: 8,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  responseChip: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default EmergencyAlertDetailsScreen;
