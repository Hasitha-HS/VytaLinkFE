import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Chip,
  Searchbar,
  SegmentedButtons,
  Snackbar,
  Button
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AlertContext } from '../context/AlertContext';
import { AuthContext } from '../context/AuthContext';
import { Colors, getBloodTypeColor, getUrgencyColor } from '../utils/Colors';
import { formatBloodType, formatDateTime } from '../utils/Constants';
import EmergencyAlertService from '../services/EmergencyAlertService';
import DonorService from '../services/DonorService';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
  const { alerts, refreshAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [alerts, searchQuery, filterType]);

  const loadData = async () => {
    try {
      await refreshAlerts();
    } catch (error) {
      console.error('Error loading notifications:', error);
      const msg = error?.message || 'Failed to load notifications.';
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDonorResponse = async (alertId, response) => {
    try {
      // Use user ID for non-donor users, or donorId if available
      const userId = user?.donorId || user?.id;
      
      if (!userId) {
        setSnackbarMessage('User ID not found. Please try logging in again.');
        setSnackbarVisible(true);
        return;
      }

      await EmergencyAlertService.respondToAlert(alertId, userId, response);
      setSnackbarMessage(`Response "${response}" submitted successfully!`);
      setSnackbarVisible(true);
      await refreshAlerts();
    } catch (error) {
      console.error('Error responding to alert:', error);
      const msg = error?.response?.data?.message || 'Error submitting response. Please try again.';
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    }
  };

  const handleCallDonor = async (donorId) => {
    try {
      const contact = await DonorService.getDonorContact(donorId);
      // In a real app, you would use Linking to make the call
      setSnackbarMessage(`Calling ${contact.phone}...`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error getting donor contact:', error);
      setSnackbarMessage('Error getting contact information');
      setSnackbarVisible(true);
    }
  };

  const handleSendNotification = async (donorId, alertId) => {
    try {
      const message = `Thank you for responding to the emergency blood request. Please come to the hospital as soon as possible.`;
      await DonorService.sendMessageToDonor(donorId, message, 'FCM', alertId);
      setSnackbarMessage('FCM notification sent successfully!');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error sending notification:', error);
      setSnackbarMessage('Error sending notification');
      setSnackbarVisible(true);
    }
  };

  const filterNotifications = () => {
    let filtered = [...alerts];

    // Filter by type
    if (filterType === 'active') {
      filtered = filtered.filter(alert => alert.status === 'ACTIVE');
    } else if (filterType === 'critical') {
      filtered = filtered.filter(alert => alert.urgencyLevel === 'CRITICAL');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.hospitalName.toLowerCase().includes(query) ||
        alert.bloodType.toLowerCase().includes(query) ||
        alert.urgencyLevel.toLowerCase().includes(query) ||
        (alert.patientName && alert.patientName.toLowerCase().includes(query))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredAlerts(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'radio-button-on';
      case 'FULFILLED':
        return 'checkmark-circle';
      case 'EXPIRED':
        return 'time-outline';
      case 'CANCELLED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return Colors.success;
      case 'FULFILLED':
        return Colors.primary;
      case 'EXPIRED':
        return Colors.warning;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.gray[500];
    }
  };

  const renderNotificationItem = ({ item: alert }) => {
    const isDonor = user?.role === 'DONOR';
    const userId = user?.donorId || user?.id;
    const hasResponded = alert.responses?.some(r => r.donorId === userId);
    const userResponse = alert.responses?.find(r => r.donorId === userId);

    return (
      <Card style={styles.notificationCard}>
        <Card.Content>
          <View style={styles.notificationHeader}>
            <Avatar.Icon
              size={48}
              icon="water"
              style={[styles.bloodTypeAvatar, { backgroundColor: getBloodTypeColor(alert.bloodType) }]}
            />
            <View style={styles.notificationContent}>
              <Text variant="titleMedium" style={styles.hospitalName}>
                {alert.hospitalName}
              </Text>
              <Text variant="bodyMedium" style={styles.notificationSubtitle}>
                Needs {formatBloodType(alert.bloodType)} - {alert.unitsNeeded} units
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatDateTime(alert.createdAt)}
              </Text>
            </View>
            <View style={styles.notificationMeta}>
              <Chip
                mode="outlined"
                textStyle={[styles.urgencyChip, { color: getUrgencyColor(alert.urgencyLevel) }]}
                style={[styles.urgencyChipContainer, { borderColor: getUrgencyColor(alert.urgencyLevel) }]}
              >
                {alert.urgencyLevel}
              </Chip>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(alert.status)}
                  size={16}
                  color={getStatusColor(alert.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(alert.status) }]}>
                  {alert.status}
                </Text>
              </View>
            </View>
          </View>

          {alert.message && (
            <Text variant="bodySmall" style={styles.alertMessage} numberOfLines={2}>
              "{alert.message}"
            </Text>
          )}

          {alert.responses && alert.responses.length > 0 && (
            <View style={styles.responseStats}>
              <Text variant="bodySmall" style={styles.responseText}>
                {alert.responses.filter(r => r.response === 'ACCEPTED').length} accepted • {' '}
                {alert.responses.filter(r => r.response === 'DECLINED').length} declined • {' '}
                {alert.notificationsSent || 0} notified
              </Text>
            </View>
          )}

          {/* Donor Response Buttons */}
          {isDonor && alert.status === 'ACTIVE' && (
            <View style={styles.donorResponseSection}>
              {hasResponded ? (
                <View style={styles.responseStatus}>
                  <Text variant="bodyMedium" style={styles.responseStatusText}>
                    Your Response: {userResponse?.response || 'NO_RESPONSE'}
                  </Text>
                  {userResponse?.response === 'ACCEPTED' && (
                    <Text variant="bodySmall" style={styles.responseNote}>
                      Thank you! Staff will contact you soon.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.donorResponseButtons}>
                  <Button
                    mode="contained"
                    onPress={() => handleDonorResponse(alert.id, 'ACCEPTED')}
                    style={[styles.responseButton, { backgroundColor: Colors.success }]}
                    icon="check"
                  >
                    Can Donate
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDonorResponse(alert.id, 'DECLINED')}
                    style={[styles.responseButton, { borderColor: Colors.error }]}
                    icon="close"
                    textColor={Colors.error}
                  >
                    Not Available
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Staff Action Buttons */}
          {!isDonor && (
            <View style={styles.staffActionButtons}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EmergencyAlertDetails', { alertId: alert.id })}
                style={styles.actionButton}
                icon="eye"
              >
                View Details
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleSendNotification(alert.responses?.[0]?.donorId, alert.id)}
                style={styles.actionButton}
                icon="bell"
                disabled={!alert.responses?.length}
              >
                Send FCM
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color={Colors.gray[400]} />
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Notifications
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {searchQuery ? 'No notifications match your search' : 'You have no notifications yet'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Navigation */}
      <View style={styles.headerSection}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.headerTitle}>
              Emergency Alerts
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Manage and respond to blood emergency requests
            </Text>
            
            <View style={styles.headerButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('EmergencyAlertCreation')}
                style={[styles.headerButton, { backgroundColor: Colors.error }]}
                icon="plus"
              >
                Create Alert
              </Button>
              
              {/* Only show Manage Donors for Admin/Staff */}
              {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('DonorManagement')}
                  style={styles.headerButton}
                  icon="account-group"
                >
                  Manage Donors
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notifications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={[
            { value: 'all', label: 'All', icon: 'list' },
            { value: 'active', label: 'Active', icon: 'radio-button-on' },
            { value: 'critical', label: 'Critical', icon: 'warning' },
          ]}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredAlerts}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyComponent}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: Colors.gray[800] }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  
  // Header Section
  headerSection: {
    padding: 16,
    paddingBottom: 8,
  },
  headerCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.gray[600],
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: Colors.white,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bloodTypeAvatar: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  hospitalName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationSubtitle: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  timestamp: {
    color: Colors.gray[500],
    fontSize: 12,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  urgencyChipContainer: {
    marginBottom: 8,
  },
  urgencyChip: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  alertMessage: {
    marginTop: 12,
    fontStyle: 'italic',
    color: Colors.gray[600],
    backgroundColor: Colors.gray[50],
    padding: 8,
    borderRadius: 4,
  },
  responseStats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  responseText: {
    color: Colors.gray[500],
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: Colors.gray[600],
  },
  emptySubtitle: {
    color: Colors.gray[500],
    textAlign: 'center',
  },
  // Donor Response Styles
  donorResponseSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  donorResponseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  responseButton: {
    flex: 1,
  },
  responseStatus: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
  },
  responseStatusText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  responseNote: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  // Staff Action Styles
  staffActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default NotificationsScreen;


