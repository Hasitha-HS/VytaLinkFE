import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Searchbar,
  Chip,
  FAB,
  Portal,
  Modal,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import CampService from '../services/CampService';

const CampManagementScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const statusOptions = [
    { key: 'ALL', label: 'All', color: Colors.gray[500] },
    { key: 'PENDING', label: 'Pending', color: Colors.warning },
    { key: 'APPROVED', label: 'Approved', color: Colors.success },
    { key: 'REJECTED', label: 'Rejected', color: Colors.error },
    { key: 'COMPLETED', label: 'Completed', color: Colors.primary }
  ];

  useEffect(() => {
    loadCamps();
  }, []);

  useEffect(() => {
    filterCamps();
  }, [camps, searchQuery, selectedStatus]);

  const loadCamps = async () => {
    try {
      setLoading(true);
      const campsData = await CampService.getAllCamps();
      setCamps(campsData);
    } catch (error) {
      console.error('Error loading camps:', error);
      Alert.alert('Error', 'Failed to load camps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCamps();
    setRefreshing(false);
  };

  const filterCamps = () => {
    let filtered = camps;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(camp =>
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.organizerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(camp => camp.status === selectedStatus);
    }

    setFilteredCamps(filtered);
  };

  const handleCreateCamp = () => {
    navigation.navigate('CampCreation');
  };

  const handleViewCamp = (campId) => {
    navigation.navigate('CampDetails', { campId });
  };

  const handleReviewRequest = (campId) => {
    navigation.navigate('CampReview', { campId });
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption ? statusOption.color : Colors.gray[500];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderCampCard = (camp) => (
    <Card key={camp.id} style={styles.campCard}>
      <Card.Content>
        <View style={styles.campHeader}>
          <View style={styles.campTitleSection}>
            <Text variant="titleMedium" style={styles.campName}>
              {camp.name}
            </Text>
            <Text variant="bodyMedium" style={styles.campLocation}>
              📍 {camp.location}
            </Text>
          </View>
          <Chip
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(camp.status) }]}
            textStyle={{ color: getStatusColor(camp.status) }}
          >
            {camp.status}
          </Chip>
        </View>

        <View style={styles.campDetails}>
          <View style={styles.detailRow}>
            <Icon {...getIcon('calendar', 16, Colors.gray[600])} />
            <Text variant="bodySmall" style={styles.detailText}>
              {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon {...getIcon('account', 16, Colors.gray[600])} />
            <Text variant="bodySmall" style={styles.detailText}>
              Organizer: {camp.organizerName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon {...getIcon('account-group', 16, Colors.gray[600])} />
            <Text variant="bodySmall" style={styles.detailText}>
              Expected Donors: {camp.expectedDonors || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.campActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewCamp(camp.id)}
            style={styles.actionButton}
            compact
          >
            View Details
          </Button>
          
          {(user?.role === 'ADMIN' || user?.role === 'STAFF') && camp.status === 'PENDING' && (
            <Button
              mode="contained"
              onPress={() => handleReviewRequest(camp.id)}
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              compact
            >
              Review
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

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
          Loading camps...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Camp Management
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Manage blood donation camps and review requests
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search camps..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {statusOptions.map((option) => (
            <Chip
              key={option.key}
              selected={selectedStatus === option.key}
              onPress={() => setSelectedStatus(option.key)}
              style={[
                styles.filterChip,
                selectedStatus === option.key && { backgroundColor: option.color + '20' }
              ]}
              textStyle={{
                color: selectedStatus === option.key ? option.color : Colors.gray[600]
              }}
            >
              {option.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Camps List */}
      <ScrollView
        style={styles.campsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredCamps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon {...getIcon('calendar-outline', 64, Colors.gray[400])} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No camps found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {searchQuery || selectedStatus !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'No camps have been created yet'}
            </Text>
          </View>
        ) : (
          filteredCamps.map(renderCampCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {(user?.role === 'CAMP_ORGANIZER' || user?.role === 'ADMIN') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateCamp}
          label="Create Camp"
        />
      )}
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
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  campsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  campCard: {
    marginBottom: 12,
    elevation: 2,
  },
  campHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campTitleSection: {
    flex: 1,
    marginRight: 8,
  },
  campName: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  campLocation: {
    color: Colors.gray[600],
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  campDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: Colors.gray[600],
  },
  campActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    marginTop: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default CampManagementScreen;
