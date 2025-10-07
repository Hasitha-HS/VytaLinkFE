import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Portal,
  Modal,
  Snackbar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import AlertCard from '../components/alerts/AlertCard';
// import EmergencyAlertDialog from '../components/alerts/EmergencyAlertDialog';
import { Colors } from '../utils/Colors';
import { formatBloodType } from '../utils/Constants';
import EmergencyAlertService from '../services/EmergencyAlertService';
import Icon from '../components/common/Icon';
import { Icons, getIcon } from '../utils/Icons';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { alerts, refreshAlerts } = useContext(AlertContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Mock news data - replace with actual API call
  const [latestNews] = useState({
    title: "Blood Donation Drive Success",
    content: "Our recent blood donation drive collected over 500 units, helping save countless lives in our community.",
    date: "2 hours ago"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await refreshAlerts();
    } catch (error) {
      console.error('Error loading data:', error);
      const msg = error?.message || 'Error loading data. Please try again.';
      showSnackbar(msg);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEmergencyResponse = async (alertId, response) => {
    try {
      await EmergencyAlertService.respondToAlert(alertId, user.donorId || user.id, response);
      showSnackbar(`Response "${response}" submitted successfully!`);
      await refreshAlerts();
    } catch (error) {
      console.error('Error responding to alert:', error);
      const msg = error?.message || 'Error submitting response. Please try again.';
      showSnackbar(msg);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'ACTIVE');
  const canCreateAlerts = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // Calculate next donation eligibility
  const getNextDonationEligibility = () => {
    if (!user?.lastDonationDate) return "Eligible now";
    
    const lastDonation = new Date(user.lastDonationDate);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks
    
    const now = new Date();
    if (nextEligible <= now) return "Eligible now";
    
    const daysLeft = Math.ceil((nextEligible - now) / (1000 * 60 * 60 * 24));
    return `${daysLeft} days`;
  };

  // Calculate lives saved (assuming 1 donation = 3 lives saved)
  const getLivesSaved = () => {
    return (user?.totalDonations || 0) * 3;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Icon Test Section - Temporary */}
        <View style={styles.newsSection}>
          <Card style={styles.newsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.newsTitle}>
                Icon Test
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                <Icon {...getIcon('tabHome', 32, Colors.primary)} />
                <Icon {...getIcon('tabNotifications', 32, Colors.primary)} />
                <Icon {...getIcon('tabProfile', 32, Colors.primary)} />
              </View>
              {/* <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('IconTest')}
                style={{ marginTop: 10 }}
              >
                Test All Icons
              </Button> */}
            </Card.Content>
          </Card>
        </View>

        {/* Latest News Card */}
        <View style={styles.newsSection}>
          <Card style={styles.newsCard}>
            <Card.Content>
              <View style={styles.newsHeader}>
                <Icon {...getIcon('news', 24, Colors.primary)} />
                <Text variant="titleMedium" style={styles.newsTitle}>
                  Latest News
                </Text>
              </View>
              <Text variant="headlineSmall" style={styles.newsArticleTitle}>
                {latestNews.title}
              </Text>
              <Text variant="bodyMedium" style={styles.newsContent}>
                {latestNews.content}
              </Text>
              <Text variant="bodySmall" style={styles.newsDate}>
                {latestNews.date}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* User Details Card */}
        <View style={styles.userDetailsSection}>
          <Card style={styles.userDetailsCard}>
            <Card.Content>
              <View style={styles.userDetailsHeader}>
                <Icon {...getIcon('user', 24, Colors.primary)} />
                <Text variant="titleMedium" style={styles.userDetailsTitle}>
                  Your Profile
                </Text>
              </View>
              
              <View style={styles.userDetailsGrid}>
                <View style={styles.userDetailItem}>
                  <Text variant="bodySmall" style={styles.userDetailLabel}>Name</Text>
                  <Text 
                    variant="titleMedium" 
                    style={styles.userDetailValue}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user?.name || user?.username || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.userDetailItem}>
                  <Text variant="bodySmall" style={styles.userDetailLabel}>Lives Saved</Text>
                  <Text variant="titleMedium" style={[styles.userDetailValue, { color: Colors.success }]}>
                    {getLivesSaved()}
                  </Text>
                </View>
                
                <View style={styles.userDetailItem}>
                  <Text variant="bodySmall" style={styles.userDetailLabel}>Next Donation</Text>
                  <Text variant="titleMedium" style={[styles.userDetailValue, { color: Colors.primary }]}>
                    {getNextDonationEligibility()}
                  </Text>
                </View>
                
                <View style={styles.userDetailItem}>
                  <Text variant="bodySmall" style={styles.userDetailLabel}>Blood Type</Text>
                  <Text variant="titleMedium" style={[styles.userDetailValue, { color: Colors.error }]}>
                    {formatBloodType(user?.bloodType) || 'N/A'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Emergency Alerts Section */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Icon {...getIcon('warning', 24, Colors.error)} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Emergency Alerts
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeAlerts.length}</Text>
              </View>
            </View>

            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onRespond={handleEmergencyResponse}
                currentUser={user}
              />
            ))}
          </View>
        )}

        {/* Navigation Panel */}
        <View style={styles.navigationSection}>
          <Card style={styles.navigationCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.navigationTitle}>
                Quick Actions
              </Text>
              
              <View style={styles.navigationGrid}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Profile')}
                  style={styles.navButton}
                  icon="account"
                >
                  Profile
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Notifications')}
                  style={styles.navButton}
                  icon="bell"
                >
                  Alerts
                </Button>
                
                {user?.role !== 'DONOR' && (
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonorRegistration')}
                    style={styles.navButton}
                    icon="water"
                  >
                    Become Donor
                  </Button>
                )}
                
                {canCreateAlerts && (
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('EmergencyAlertCreation')}
                    style={[styles.navButton, { backgroundColor: Colors.error }]}
                    icon="alert"
                  >
                    Create Alert
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Emergency Alert Creation Dialog */}
      <Portal>
        <Modal
          visible={showEmergencyDialog}
          onDismiss={() => setShowEmergencyDialog(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Create Emergency Alert
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              Emergency alert creation feature coming soon!
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowEmergencyDialog(false)}
              style={styles.modalButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
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
  scrollView: {
    flex: 1,
  },
  
  // News Section
  newsSection: {
    padding: 16,
    paddingBottom: 8,
  },
  newsCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  newsArticleTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.gray[800],
  },
  newsContent: {
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 8,
  },
  newsDate: {
    color: Colors.gray[500],
    fontStyle: 'italic',
  },
  
  // User Details Section
  userDetailsSection: {
    padding: 16,
    paddingTop: 8,
  },
  userDetailsCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  userDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetailsTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  userDetailItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  userDetailLabel: {
    color: Colors.gray[600],
    marginBottom: 4,
    textAlign: 'center',
  },
  userDetailValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Alerts Section
  alertsSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    flex: 1,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Navigation Section
  navigationSection: {
    padding: 16,
    paddingTop: 8,
  },
  navigationCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  navigationTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  
  // Common
  bottomSpacing: {
    height: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.gray[900],
  },
  modalText: {
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.gray[600],
  },
  modalButton: {
    minWidth: 120,
  },
  snackbar: {
    backgroundColor: Colors.gray[800],
  },
});

export default HomeScreen;



