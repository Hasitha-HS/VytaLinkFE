import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  ActivityIndicator
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
import DashboardService from '../services/DashboardService';
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

  // Real data from API
  const [latestNews, setLatestNews] = useState({
    title: "Blood Donation Drive Success",
    content: "Our recent blood donation drive collected over 500 units, helping save countless lives in our community.",
    date: "2 hours ago"
  });

  const [stats, setStats] = useState({
    activeAlerts: 0,
    totalDonors: 0,
    recentDonations: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingStats(true);
      await Promise.all([
        refreshAlerts(),
        loadDashboardStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      const msg = error?.message || 'Error loading data. Please try again.';
      showSnackbar(msg);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const statsData = await DashboardService.getDashboardStats();
      setStats({
        activeAlerts: statsData.activeAlerts || 0,
        totalDonors: statsData.totalDonors || 0,
        recentDonations: statsData.recentDonations || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Keep default values if API fails
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEmergencyResponse = async (alertId, response) => {
    // Check if user is authenticated
    if (!user) {
      showSnackbar('Please log in to respond to emergency alerts');
      // Navigate to login screen
      navigation.navigate('Login');
      return;
    }

    try {
      // For now, we'll use the user ID as donor ID
      // In a real system, you'd need to check if user has a donor record
      await EmergencyAlertService.respondToAlert(alertId, user.id, response);
      showSnackbar(`Response "${response}" submitted successfully!`);
      await refreshAlerts();
    } catch (error) {
      console.error('Error responding to alert:', error);
      
      // Check if the error is about donor not found
      if (error?.message?.includes('Donor not found')) {
        showSnackbar('You need to register as a donor first. Please contact support or register as a donor.');
        // You could navigate to a donor registration screen here
        // navigation.navigate('DonorRegistration');
      } else {
        const msg = error?.message || 'Error submitting response. Please try again.';
        showSnackbar(msg);
      }
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Filter alerts to show only critical emergencies that are relevant to the current user
  const activeAlerts = alerts.filter(alert => {
    // Only show active alerts
    if (alert.status !== 'ACTIVE') return false;
    
    // Only show critical urgency alerts
    if (alert.urgencyLevel !== 'CRITICAL') return false;
    
    // For donors and users, only show alerts for their blood type or universal donors
    if (user?.role === 'DONOR' || user?.role === 'USER') {
      const userBloodType = user?.bloodType;
      const alertBloodType = alert.bloodType;
      
      // Show if it's a universal blood type request (O- or O+)
      if (alertBloodType === 'O_NEGATIVE' || alertBloodType === 'O_POSITIVE') {
        return true;
      }
      
      // Show if it matches the user's blood type
      if (userBloodType === alertBloodType) {
        return true;
      }
      
      // Show if user has O- blood (universal donor)
      if (userBloodType === 'O_NEGATIVE') {
        return true;
      }
      
      return false;
    }
    
    // For staff/admin, show all critical alerts
    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      return true;
    }
    
    return false;
  });

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
        {/* Quick Stats - Only for Admin and Staff */}
        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
          <View style={styles.statsSection}>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.statsTitle}>
                  Quick Stats
                </Text>
                {loadingStats ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text variant="bodyMedium" style={styles.loadingText}>
                      Loading statistics...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Icon {...getIcon('warning', 24, Colors.error)} />
                      <Text variant="headlineSmall" style={styles.statNumber}>
                        {stats.activeAlerts}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Active Alerts
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon {...getIcon('user', 24, Colors.primary)} />
                      <Text variant="headlineSmall" style={styles.statNumber}>
                        {stats.totalDonors}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Total Donors
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Icon {...getIcon('heart', 24, Colors.success)} />
                      <Text variant="headlineSmall" style={styles.statNumber}>
                        {stats.recentDonations}
                      </Text>
                      <Text variant="bodySmall" style={styles.statLabel}>
                        Recent Donations
                      </Text>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

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

        {/* Critical Emergencies Section - Only show for registered donors */}
        {user && user.bloodType && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Icon {...getIcon('warning', 24, Colors.error)} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Critical Emergencies
              </Text>
              {activeAlerts.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeAlerts.length}</Text>
                </View>
              )}
            </View>

            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onRespond={handleEmergencyResponse}
                  currentUser={user}
                />
              ))
            ) : (
              <Card style={styles.noAlertsCard}>
                <Card.Content>
                  <View style={styles.noAlertsContent}>
                    <Icon {...getIcon('checkmark-circle', 32, Colors.success)} />
                    <Text variant="bodyMedium" style={styles.noAlertsText}>
                      No critical emergencies requiring your attention at this time.
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* Show message for non-donors */}
        {user && !user.bloodType && (
          <View style={styles.alertsSection}>
            <Card style={styles.noAlertsCard}>
              <Card.Content>
                <View style={styles.noAlertsContent}>
                  <Icon {...getIcon('information', 32, Colors.primary)} />
                  <Text variant="bodyMedium" style={styles.noAlertsText}>
                    Register as a donor to receive emergency blood donation alerts.
                  </Text>
                </View>
              </Card.Content>
            </Card>
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
                
                {user?.role !== 'DONOR' && user?.role !== 'USER' && (
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonorRegistration')}
                    style={styles.navButton}
                    icon="water"
                  >
                    Become Donor
                  </Button>
                )}
                
                
                {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                  <>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('DonorManagement')}
                      style={styles.navButton}
                      icon="account-group"
                    >
                      Manage Donors
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('EmergencyAlertCreation')}
                      style={styles.navButton}
                      icon="alert-plus"
                    >
                      Create Alert
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('DonationHistory')}
                      style={styles.navButton}
                      icon="history"
                    >
                      Donation History
                    </Button>
                  </>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Management Section for Admin/Staff */}
        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
          <View style={styles.managementSection}>
            <Card style={styles.managementCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.managementTitle}>
                  Management Tools
                </Text>
                <Text variant="bodyMedium" style={styles.managementSubtitle}>
                  Access all system management features
                </Text>
                
                <View style={styles.managementGrid}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonorManagement')}
                    style={[styles.managementButton, { backgroundColor: Colors.primary }]}
                    icon="account-group"
                  >
                    Donor Management
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('EmergencyAlertCreation')}
                    style={[styles.managementButton, { backgroundColor: Colors.error }]}
                    icon="alert-plus"
                  >
                    Create Emergency Alert
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonationHistory')}
                    style={[styles.managementButton, { backgroundColor: Colors.success }]}
                    icon="history"
                  >
                    Donation History
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Notifications')}
                    style={[styles.managementButton, { backgroundColor: Colors.warning }]}
                    icon="bell"
                  >
                    View Alerts
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('CampManagement')}
                    style={[styles.managementButton, { backgroundColor: Colors.info }]}
                    icon="calendar"
                  >
                    Camp Management
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonationEntry')}
                    style={[styles.managementButton, { backgroundColor: Colors.secondary }]}
                    icon="plus"
                  >
                    Add Donation
                  </Button>
                  
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Camp Organizer Section */}
        {user?.role === 'CAMP_ORGANIZER' && (
          <View style={styles.managementSection}>
            <Card style={styles.managementCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.managementTitle}>
                  Camp Management
                </Text>
                <Text variant="bodyMedium" style={styles.managementSubtitle}>
                  Manage your blood donation camps
                </Text>
                
                <View style={styles.managementGrid}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('CampManagement')}
                    style={[styles.managementButton, { backgroundColor: Colors.primary }]}
                    icon="calendar"
                  >
                    My Camps
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('CampCreation')}
                    style={[styles.managementButton, { backgroundColor: Colors.success }]}
                    icon="plus"
                  >
                    Create Camp
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* User Section */}
        {user?.role === 'USER' && (
          <View style={styles.managementSection}>
            <Card style={styles.managementCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.managementTitle}>
                  Get Started
                </Text>
                <Text variant="bodyMedium" style={styles.managementSubtitle}>
                  Register as a blood donor to help save lives
                </Text>
                
                <View style={styles.managementGrid}>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('DonorRegistration')}
                    style={[styles.managementButton, { backgroundColor: Colors.primary }]}
                    icon="water"
                  >
                    Become a Donor
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('DonationHistory')}
                    style={styles.managementButton}
                    icon="history"
                  >
                    My Donations
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

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
  
  // Stats Section
  statsSection: {
    padding: 16,
    paddingBottom: 8,
  },
  statsCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  statsTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  statLabel: {
    color: Colors.gray[600],
    textAlign: 'center',
    marginTop: 4,
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
  
  // Management Section
  managementSection: {
    padding: 16,
    paddingTop: 8,
  },
  managementCard: {
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
  },
  managementTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  managementSubtitle: {
    color: Colors.gray[600],
    marginBottom: 16,
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  managementButton: {
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
  
  // No Alerts Card
  noAlertsCard: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
    borderWidth: 1,
    elevation: 1,
  },
  noAlertsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  noAlertsText: {
    marginLeft: 12,
    color: Colors.success,
    textAlign: 'center',
    flex: 1,
  },
});

export default HomeScreen;



