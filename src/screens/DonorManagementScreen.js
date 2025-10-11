import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, List, Divider, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DonorService from '../services/DonorService';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

const DonorManagementScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const bloodTypes = ['All', 'O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'];
  const statuses = ['All', 'ELIGIBLE', 'DEFERRED', 'INELIGIBLE'];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [donors, searchQuery, selectedBloodType, selectedStatus]);

  const fetchDonors = async () => {
    try {
      setIsLoading(true);
      const donorsData = await DonorService.getAllDonors();
      setDonors(donorsData);
    } catch (error) {
      console.error('Error fetching donors:', error);
      Alert.alert('Error', 'Failed to load donors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(donor => 
        donor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.phone?.includes(searchQuery) ||
        donor.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by blood type
    if (selectedBloodType !== 'All') {
      filtered = filtered.filter(donor => donor.bloodType === selectedBloodType);
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(donor => donor.eligibilityStatus === selectedStatus);
    }

    setFilteredDonors(filtered);
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

  const handleViewDonor = (donorId) => {
    navigation.navigate('DonorDetails', { donorId });
  };

  const handleEditDonor = (donorId) => {
    navigation.navigate('DonorEdit', { donorId });
  };

  const handleCallDonor = (phone) => {
    Alert.alert('Call Donor', `Calling ${phone}`);
  };

  const handleRegisterNewDonor = () => {
    navigation.navigate('DonorRegistration');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading donors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                Donors Management
              </Text>
              <Button
                mode="contained"
                onPress={handleRegisterNewDonor}
                style={styles.registerButton}
                icon="plus"
              >
                Register New
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Search and Filters */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search donors..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text variant="bodyMedium" style={styles.filterLabel}>Blood Type:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {bloodTypes.map((type) => (
                    <Chip
                      key={type}
                      selected={selectedBloodType === type}
                      onPress={() => setSelectedBloodType(type)}
                      style={[
                        styles.filterChip,
                        selectedBloodType === type && styles.selectedChip
                      ]}
                    >
                      {type === 'All' ? 'All' : type.replace('_', ' ')}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.filterItem}>
                <Text variant="bodyMedium" style={styles.filterLabel}>Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {statuses.map((status) => (
                    <Chip
                      key={status}
                      selected={selectedStatus === status}
                      onPress={() => setSelectedStatus(status)}
                      style={[
                        styles.filterChip,
                        selectedStatus === status && styles.selectedChip
                      ]}
                    >
                      {status}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Donors List */}
        <Card style={styles.listCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.listTitle}>
              Donors ({filteredDonors.length})
            </Text>
            
            {filteredDonors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon {...getIcon('user', 48, Colors.gray[400])} />
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No donors found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : (
              filteredDonors.map((donor, index) => (
                <View key={donor.id}>
                  <List.Item
                    title={donor.name || 'Unknown Donor'}
                    description={
                      <View style={styles.donorDescription}>
                        <Text variant="bodySmall" style={styles.donorInfo}>
                          {donor.bloodType?.replace('_', ' ')} | Age {donor.age} | {donor.gender}
                        </Text>
                        <Text variant="bodySmall" style={styles.donorInfo}>
                          {donor.phone}
                        </Text>
                        <Text variant="bodySmall" style={styles.donorInfo}>
                          Last Donation: {formatDate(donor.lastDonationDate)}
                        </Text>
                      </View>
                    }
                    left={(props) => (
                      <View style={styles.donorLeft}>
                        <Icon {...getIcon('user', 32, Colors.primary)} />
                        <Chip
                          style={[styles.statusChip, { backgroundColor: getStatusColor(donor.eligibilityStatus) }]}
                          textStyle={styles.statusText}
                        >
                          {donor.eligibilityStatus}
                        </Chip>
                      </View>
                    )}
                    right={() => (
                      <View style={styles.donorActions}>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => handleViewDonor(donor.id)}
                          style={styles.actionButton}
                        >
                          View
                        </Button>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => handleEditDonor(donor.id)}
                          style={styles.actionButton}
                        >
                          Edit
                        </Button>
                        <Button
                          mode="outlined"
                          compact
                          onPress={() => handleCallDonor(donor.phone)}
                          style={styles.actionButton}
                          icon="phone"
                        >
                          Call
                        </Button>
                      </View>
                    )}
                  />
                  {index < filteredDonors.length - 1 && <Divider />}
                </View>
              ))
            )}
          </Card.Content>
        </Card>
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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  registerButton: {
    backgroundColor: Colors.primary,
  },
  filterCard: {
    marginBottom: 16,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  filterChip: {
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  listCard: {
    elevation: 2,
  },
  listTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: Colors.gray[700],
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: Colors.gray[600],
  },
  emptySubtext: {
    marginTop: 8,
    color: Colors.gray[500],
  },
  donorLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  donorDescription: {
    marginTop: 4,
  },
  donorInfo: {
    color: Colors.gray[600],
    marginBottom: 2,
  },
  statusChip: {
    marginTop: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  donorActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 4,
  },
});

export default DonorManagementScreen;
