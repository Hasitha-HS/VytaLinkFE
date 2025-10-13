import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Searchbar,
  Chip,
  ActivityIndicator,
  Menu,
  Divider
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import DonationHistoryService from '../services/DonationHistoryService';

const DonationHistoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  
  // State management
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    startDate: null,
    endDate: null,
    donationType: null,
    status: null,
    bloodType: null,
    phone: '',
    name: '',
    location: '',
    bloodBankName: '',
    eligibilityFilter: 'ALL'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  // Menu states
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [bloodTypeMenuVisible, setBloodTypeMenuVisible] = useState(false);
  const [eligibilityMenuVisible, setEligibilityMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (filterOptions) {
      loadDonations();
    }
  }, [selectedFilters, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFilterOptions(),
        loadDonations()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load donation history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const options = await DonationHistoryService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadDonations = async () => {
    try {
      const filters = {
        ...selectedFilters,
        page: currentPage,
        size: pageSize
      };

      const response = await DonationHistoryService.getAllDonationsWithFilters(filters);
      
      setDonations(response.donations || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
      setStatistics(response.statistics || null);
    } catch (error) {
      console.error('Error loading donations:', error);
      Alert.alert('Error', 'Failed to load donations. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(0);
    await loadDonations();
    setRefreshing(false);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSelectedFilters({
      startDate: null,
      endDate: null,
      donationType: null,
      status: null,
      bloodType: null,
      phone: '',
      name: '',
      location: '',
      bloodBankName: '',
      eligibilityFilter: 'ALL'
    });
    setSearchQuery('');
    setCurrentPage(0);
  };

  const handleSearch = () => {
    // Apply search query to name filter
    handleFilterChange('name', searchQuery);
  };

  const renderFilterChips = () => {
    const activeFilters = Object.entries(selectedFilters)
      .filter(([key, value]) => value && value !== 'ALL' && value !== '')
      .map(([key, value]) => ({ key, value }));

    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <Text variant="bodySmall" style={styles.filterChipsLabel}>
          Active Filters:
        </Text>
        <View style={styles.filterChips}>
          {activeFilters.map(({ key, value }) => (
            <Chip
              key={key}
              onClose={() => handleFilterChange(key, key === 'eligibilityFilter' ? 'ALL' : '')}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {key}: {value}
            </Chip>
          ))}
          <Chip
            onPress={clearFilters}
            style={[styles.filterChip, styles.clearAllChip]}
            textStyle={styles.clearAllChipText}
          >
            Clear All
          </Chip>
        </View>
      </View>
    );
  };

  const renderFilterMenu = (title, visible, onDismiss, items, selectedValue, onSelect) => (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={
        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.filterButton}
          contentStyle={styles.filterButtonContent}
        >
          {title}: {selectedValue || 'All'}
        </Button>
      }
    >
      <Menu.Item
        onPress={() => {
          onSelect(null);
          onDismiss();
        }}
        title="All"
      />
      <Divider />
      {items.map((item) => (
        <Menu.Item
          key={item}
          onPress={() => {
            onSelect(item);
            onDismiss();
          }}
          title={item}
        />
      ))}
    </Menu>
  );

  const renderDonationCard = (donation) => (
    <Card key={donation.id} style={styles.donationCard}>
      <Card.Content>
        <View style={styles.donationHeader}>
          <View style={styles.donationInfo}>
            <Text variant="titleMedium" style={styles.donorName}>
              {donation.donorName}
            </Text>
            <Text variant="bodySmall" style={styles.donorPhone}>
              {donation.donorPhone}
            </Text>
          </View>
          <View style={styles.donationStatus}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: DonationHistoryService.getStatusColor(donation.status) + '20' }
              ]}
              textStyle={[
                styles.statusChipText,
                { color: DonationHistoryService.getStatusColor(donation.status) }
              ]}
            >
              {donation.status}
            </Chip>
          </View>
        </View>

        <View style={styles.donationDetails}>
          <View style={styles.detailRow}>
            <Icon {...getIcon('water', 16, Colors.primary)} />
            <Text variant="bodySmall" style={styles.detailText}>
              {DonationHistoryService.formatBloodType(donation.bloodType)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon {...getIcon('calendar', 16, Colors.primary)} />
            <Text variant="bodySmall" style={styles.detailText}>
              {new Date(donation.donationDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon {...getIcon('medical-bag', 16, Colors.primary)} />
            <Text variant="bodySmall" style={styles.detailText}>
              {DonationHistoryService.formatDonationType(donation.donationType)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon {...getIcon('map-marker', 16, Colors.primary)} />
            <Text variant="bodySmall" style={styles.detailText}>
              {donation.location || 'N/A'}
            </Text>
          </View>
        </View>

        {donation.nextEligibleDate && (
          <View style={styles.eligibilityRow}>
            <Text variant="bodySmall" style={styles.eligibilityLabel}>
              Next Eligible:
            </Text>
            <Chip
              style={[
                styles.eligibilityChip,
                { backgroundColor: DonationHistoryService.getEligibilityColor(donation) + '20' }
              ]}
              textStyle={[
                styles.eligibilityChipText,
                { color: DonationHistoryService.getEligibilityColor(donation) }
              ]}
            >
              {new Date(donation.nextEligibleDate).toLocaleDateString()}
            </Chip>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Card style={styles.statisticsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statisticsTitle}>
            Statistics
          </Text>
          <View style={styles.statisticsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {statistics.totalDonations}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Donations
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: Colors.success }]}>
                {statistics.completedDonations}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: Colors.warning }]}>
                {statistics.deferredDonations}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Deferred
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statNumber, { color: Colors.error }]}>
                {statistics.cancelledDonations}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Cancelled
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <Button
          mode="outlined"
          onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          style={styles.paginationButton}
        >
          Previous
        </Button>
        
        <Text variant="bodyMedium" style={styles.paginationText}>
          Page {currentPage + 1} of {totalPages}
        </Text>
        
        <Button
          mode="outlined"
          onPress={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          style={styles.paginationButton}
        >
          Next
        </Button>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading donation history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Donation History
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            View and filter all donation records
          </Text>
        </Card.Content>
      </Card>

      {/* Search */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search by donor name..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
          />
        </Card.Content>
      </Card>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.filtersTitle}>
            Filters
          </Text>
          
          <View style={styles.filtersRow}>
            {renderFilterMenu(
              'Type',
              typeMenuVisible,
              () => setTypeMenuVisible(false),
              filterOptions?.donationTypes || [],
              selectedFilters.donationType,
              (value) => handleFilterChange('donationType', value)
            )}
            
            {renderFilterMenu(
              'Status',
              statusMenuVisible,
              () => setStatusMenuVisible(false),
              filterOptions?.donationStatuses || [],
              selectedFilters.status,
              (value) => handleFilterChange('status', value)
            )}
            
            {renderFilterMenu(
              'Blood Type',
              bloodTypeMenuVisible,
              () => setBloodTypeMenuVisible(false),
              filterOptions?.bloodTypes || [],
              selectedFilters.bloodType,
              (value) => handleFilterChange('bloodType', value)
            )}
            
            {renderFilterMenu(
              'Eligibility',
              eligibilityMenuVisible,
              () => setEligibilityMenuVisible(false),
              filterOptions?.eligibilityFilters || [],
              selectedFilters.eligibilityFilter,
              (value) => handleFilterChange('eligibilityFilter', value)
            )}
          </View>
          
          {renderFilterChips()}
        </Card.Content>
      </Card>

      {/* Statistics */}
      {renderStatistics()}

      {/* Donations List */}
      <ScrollView
        style={styles.donationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {donations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon {...getIcon('water-outline', 64, Colors.gray[400])} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No donations found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        ) : (
          donations.map(renderDonationCard)
        )}
      </ScrollView>

      {/* Pagination */}
      {renderPagination()}
    </View>
  );
};

const getIcon = (iconName, size, color) => ({
  type: 'Ionicons',
  name: iconName,
  size,
  color
});

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
    color: Colors.text.secondary,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    color: Colors.text.secondary,
    marginTop: 4,
  },
  searchCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: Colors.white,
  },
  filtersCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  filtersTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginBottom: 8,
  },
  filterButtonContent: {
    height: 40,
  },
  filterChipsContainer: {
    marginTop: 12,
  },
  filterChipsLabel: {
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: Colors.primary + '20',
  },
  filterChipText: {
    color: Colors.primary,
  },
  clearAllChip: {
    backgroundColor: Colors.error + '20',
  },
  clearAllChipText: {
    color: Colors.error,
  },
  statisticsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statisticsTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  donationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  donationCard: {
    marginBottom: 12,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donorName: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  donorPhone: {
    color: Colors.text.secondary,
    marginTop: 2,
  },
  donationStatus: {
    marginLeft: 12,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  donationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: Colors.text.secondary,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  eligibilityLabel: {
    color: Colors.text.secondary,
  },
  eligibilityChip: {
    height: 24,
  },
  eligibilityChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  paginationButton: {
    minWidth: 80,
  },
  paginationText: {
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});

export default DonationHistoryScreen;