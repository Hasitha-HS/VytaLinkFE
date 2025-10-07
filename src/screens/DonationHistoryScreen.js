import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Chip,
  FAB,
  Portal,
  Modal,
  Searchbar,
  SegmentedButtons,
  Snackbar
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import DonationService from '../services/DonationService';
import { Colors } from '../utils/Colors';
import { formatDate } from '../utils/Constants';

const DonationHistoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, searchQuery, filterType]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await DonationService.getDonorHistory(user.id);
      setDonations(response || []);
    } catch (error) {
      console.error('Error loading donations:', error);
      const msg = error?.message || 'Failed to load donation history.';
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    setRefreshing(false);
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Filter by type
    if (filterType === 'recent') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(donation => 
        new Date(donation.donationDate) >= sixMonthsAgo
      );
    } else if (filterType === 'completed') {
      filtered = filtered.filter(donation => donation.status === 'COMPLETED');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(donation =>
        donation.bloodBankName?.toLowerCase().includes(query) ||
        donation.location?.toLowerCase().includes(query) ||
        donation.donationType?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));

    setFilteredDonations(filtered);
  };

  const getDonationTypeColor = (type) => {
    const colors = {
      'WHOLE_BLOOD': Colors.error,
      'PLASMA': Colors.warning,
      'PLATELETS': Colors.primary
    };
    return colors[type] || Colors.gray[500];
  };

  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': Colors.success,
      'DEFERRED': Colors.warning,
      'CANCELLED': Colors.error
    };
    return colors[status] || Colors.gray[500];
  };

  const renderDonationItem = ({ item: donation }) => (
    <Card style={styles.donationCard}>
      <Card.Content>
        <View style={styles.donationHeader}>
          <Avatar.Icon
            size={48}
            icon="water"
            style={[styles.donationAvatar, { backgroundColor: getDonationTypeColor(donation.donationType) }]}
          />
          <View style={styles.donationContent}>
            <Text variant="titleMedium" style={styles.bloodBankName}>
              {donation.bloodBankName || 'Blood Bank'}
            </Text>
            <Text variant="bodyMedium" style={styles.donationLocation}>
              {donation.location}
            </Text>
            <Text variant="bodySmall" style={styles.donationDate}>
              {formatDate(donation.donationDate)}
            </Text>
          </View>
          <View style={styles.donationMeta}>
            <Chip
              mode="outlined"
              textStyle={[styles.typeChip, { color: getDonationTypeColor(donation.donationType) }]}
              style={[styles.typeChipContainer, { borderColor: getDonationTypeColor(donation.donationType) }]}
            >
              {donation.donationType?.replace('_', ' ')}
            </Chip>
            <Chip
              mode="flat"
              textStyle={[styles.statusChip, { color: Colors.white }]}
              style={[styles.statusChipContainer, { backgroundColor: getStatusColor(donation.status) }]}
            >
              {donation.status}
            </Chip>
          </View>
        </View>

        {donation.volumeDonated && (
          <View style={styles.volumeContainer}>
            <Ionicons name="water" size={16} color={Colors.primary} />
            <Text variant="bodySmall" style={styles.volumeText}>
              {donation.volumeDonated}ml donated
            </Text>
          </View>
        )}

        {donation.notes && (
          <View style={styles.notesContainer}>
            <Text variant="bodySmall" style={styles.notesText}>
              Notes: {donation.notes}
            </Text>
          </View>
        )}

        {donation.nextEligibleDate && (
          <View style={styles.eligibilityContainer}>
            <Ionicons name="calendar" size={16} color={Colors.success} />
            <Text variant="bodySmall" style={styles.eligibilityText}>
              Next eligible: {formatDate(donation.nextEligibleDate)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart" size={64} color={Colors.gray[400]} />
      <Text variant="titleLarge" style={styles.emptyTitle}>
        No Donations Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Your donation history will appear here once you start donating
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search donations..."
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
            { value: 'recent', label: 'Recent', icon: 'time' },
            { value: 'completed', label: 'Completed', icon: 'checkmark' },
          ]}
        />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsContent}>
            <Text variant="headlineMedium" style={styles.totalDonations}>
              {user.totalDonations || 0}
            </Text>
            <Text variant="bodyMedium" style={styles.statsLabel}>
              Total Donations
            </Text>
            {user.lastDonationDate && (
              <Text variant="bodySmall" style={styles.lastDonation}>
                Last: {formatDate(user.lastDonationDate)}
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Donations List */}
      <FlatList
        data={filteredDonations}
        renderItem={renderDonationItem}
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
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsCard: {
    backgroundColor: Colors.primary,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  totalDonations: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  statsLabel: {
    color: Colors.white,
    marginTop: 4,
  },
  lastDonation: {
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  donationCard: {
    marginBottom: 12,
    backgroundColor: Colors.white,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donationAvatar: {
    marginRight: 12,
  },
  donationContent: {
    flex: 1,
  },
  bloodBankName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donationLocation: {
    color: Colors.gray[600],
    marginBottom: 4,
  },
  donationDate: {
    color: Colors.gray[500],
    fontSize: 12,
  },
  donationMeta: {
    alignItems: 'flex-end',
  },
  typeChipContainer: {
    marginBottom: 8,
  },
  typeChip: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusChipContainer: {
    paddingHorizontal: 4,
  },
  statusChip: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  volumeText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.gray[50],
    borderRadius: 4,
  },
  notesText: {
    color: Colors.gray[600],
    fontStyle: 'italic',
  },
  eligibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eligibilityText: {
    marginLeft: 4,
    color: Colors.success,
    fontWeight: '500',
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
    paddingHorizontal: 32,
  },
});

export default DonationHistoryScreen;


