import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

import { AuthContext } from '../context/AuthContext';
// import DonorRegistrationDialog from '../components/profile/DonorRegistrationDialog';
// import StatsCard from '../components/profile/StatsCard';
import { Colors, getBloodTypeColor } from '../utils/Colors';
import { formatBloodType, formatDate } from '../utils/Constants';
import AuthService from '../services/AuthService';
import DonorService from '../services/DonorService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile and donor data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile details
        const profileData = await AuthService.getProfile();
        setUserProfile(profileData);
        
        // Try to fetch donor profile by email (more reliable for hiding donor actions)
        try {
          const donorData = await DonorService.getDonorByEmail(profileData.email || user.email);
          setDonorProfile(donorData);
        } catch (donorError) {
          console.log('No donor profile found:', donorError);
          setDonorProfile(null);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              // Ensure local logout even if API call fails
              logout();
            }
          }
        }
      ]
    );
  };

  const handleUpdateProfile = (updatedData) => {
    updateUser(updatedData);
    setShowEditDialog(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text variant="titleLarge">Loading...</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text variant="titleMedium" style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text variant="titleLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button mode="contained" onPress={() => {
            setError(null);
            setIsLoading(true);
            // Retry fetching data
            const fetchProfileData = async () => {
              try {
                const profileData = await AuthService.getProfile();
                setUserProfile(profileData);
                if (profileData.role === 'DONOR' || user.role === 'DONOR') {
                  try {
                    const donorData = await DonorService.getDonorByUserId(user.id);
                    setDonorProfile(donorData);
                  } catch (donorError) {
                    setDonorProfile(null);
                  }
                }
              } catch (error) {
                setError('Failed to load profile data');
              } finally {
                setIsLoading(false);
              }
            };
            fetchProfileData();
          }}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  // Use userProfile if available, otherwise fall back to user
  const displayUser = userProfile || user;
  const isDonor = !!donorProfile || displayUser.role === 'DONOR';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={[styles.profileAvatar, { 
                backgroundColor: isDonor && donorProfile?.bloodType 
                  ? getBloodTypeColor(donorProfile.bloodType) 
                  : Colors.primary 
              }]}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {displayUser.username || displayUser.name || 'User'}
              </Text>
              {isDonor && donorProfile?.bloodType && (
                <Text variant="titleMedium" style={styles.bloodType}>
                  {formatBloodType(donorProfile.bloodType)}
                </Text>
              )}
              <Text variant="bodyMedium" style={styles.userRole}>
                {displayUser.role}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section - Only show if user is a donor */}
        {isDonor && (
          <View style={styles.statsSection}>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.statsTitle}>Donation Statistics</Text>
                <View style={styles.statsRow}>
                  <Text variant="bodyMedium">Total Donations: {donorProfile?.totalDonations || 0}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text variant="bodyMedium">Last Donation: {donorProfile?.lastDonationDate ? formatDate(donorProfile.lastDonationDate) : 'Never'}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text variant="bodyMedium">Status: {donorProfile?.eligibilityStatus || 'ELIGIBLE'}</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* User Information */}
        <Card style={styles.infoCard}>
          <Card.Title title="User Information" left={(props) => <Icon {...getIcon('user', 24, Colors.primary)} />} />
          <Card.Content>
            <List.Item
              title="Username"
              description={displayUser.username || 'Not available'}
              left={(props) => <List.Icon icon="account" />}
            />
            <List.Item
              title="Email"
              description={displayUser.email || 'Not available'}
              left={(props) => <List.Icon icon="email" />}
            />
            <List.Item
              title="Role"
              description={displayUser.role || 'Not available'}
              left={(props) => <List.Icon icon="shield-account" />}
            />
            {displayUser.createdAt && (
              <List.Item
                title="Member Since"
                description={formatDate(displayUser.createdAt)}
                left={(props) => <List.Icon icon="calendar" />}
              />
            )}
          </Card.Content>
        </Card>

        {/* Donor Information - Only show if user is a donor */}
        {isDonor ? (
          <Card style={styles.infoCard}>
            <Card.Title title="Donor Information" left={(props) => <Icon {...getIcon('bloodDrop', 24, Colors.primary)} />} />
            <Card.Content>
              <List.Item
                title="Full Name"
                description={donorProfile?.name || 'Not registered'}
                left={(props) => <List.Icon icon="account" />}
              />
              <List.Item
                title="Blood Type"
                description={donorProfile?.bloodType ? formatBloodType(donorProfile.bloodType) : 'Not registered'}
                left={(props) => <List.Icon icon="water" />}
              />
              <List.Item
                title="Phone Number"
                description={donorProfile?.phone || 'Not registered'}
                left={(props) => <List.Icon icon="phone" />}
              />
              <List.Item
                title="Age"
                description={donorProfile?.age ? `${donorProfile.age} years old` : 'Not registered'}
                left={(props) => <List.Icon icon="calendar" />}
              />
              <List.Item
                title="Gender"
                description={donorProfile?.gender || 'Not registered'}
                left={(props) => <List.Icon icon="human-male-female" />}
              />
              {donorProfile?.weight && (
                <List.Item
                  title="Weight"
                  description={`${donorProfile.weight} kg`}
                  left={(props) => <List.Icon icon="scale" />}
                />
              )}
              {donorProfile?.address && (
                <List.Item
                  title="Address"
                  description={donorProfile.address}
                  left={(props) => <List.Icon icon="map-marker" />}
                />
              )}
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.infoCard}>
            <Card.Title title="Donor Status" left={(props) => <Icon {...getIcon('bloodDrop', 24, Colors.primary)} />} />
            <Card.Content>
              <Text variant="bodyLarge" style={styles.notRegisteredText}>
                Not registered as a donor
              </Text>
              <Text variant="bodyMedium" style={styles.notRegisteredSubtext}>
                Register as a donor to help save lives and access donor features.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            {!isDonor && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DonorRegistration')}
                style={[styles.actionButton, styles.donorButton]}
                icon="water"
              >
                Register as Donor
              </Button>
            )}
            
            {isDonor && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('DonationHistory')}
                style={styles.actionButton}
                icon="history"
              >
                Donation History
              </Button>
            )}
            
            <Button
              mode="outlined"
              onPress={() => setShowEditDialog(true)}
              style={styles.actionButton}
              icon="pencil"
            >
              Update Profile
            </Button>
            
            <Divider style={styles.divider} />
            
            <Button
              mode="contained"
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
              buttonColor={Colors.error}
              icon="logout"
            >
              Logout
            </Button>
          </Card.Content>
        </Card>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Portal>
        <Modal
          visible={showEditDialog}
          onDismiss={() => setShowEditDialog(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Update Profile
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              Profile update feature coming soon!
            </Text>
            <Button 
              mode="contained" 
              onPress={() => setShowEditDialog(false)}
              style={styles.modalButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 50, // Add extra top padding to account for status bar
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bloodType: {
    color: Colors.white,
    marginBottom: 4,
  },
  userRole: {
    color: Colors.white,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  statsSection: {
    padding: 16,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    marginVertical: 4,
  },
  donorButton: {
    backgroundColor: Colors.primary,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  bottomSpacing: {
    height: 32,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  notRegisteredText: {
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  notRegisteredSubtext: {
    color: Colors.gray[500],
    textAlign: 'center',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
  },
  statsTitle: {
    marginBottom: 12,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statsRow: {
    marginBottom: 8,
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
});

export default ProfileScreen;


