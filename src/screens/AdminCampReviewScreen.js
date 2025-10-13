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
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import CampService from '../services/CampService';

const AdminCampReviewScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');

  const statusOptions = [
    { key: 'PENDING', label: 'Pending Review', color: Colors.warning },
    { key: 'APPROVED', label: 'Approved', color: Colors.success },
    { key: 'REJECTED', label: 'Rejected', color: Colors.error },
    { key: 'ALL', label: 'All Requests', color: Colors.gray[500] }
  ];

  useEffect(() => {
    loadCampRequests();
  }, []);

  useEffect(() => {
    filterCamps();
  }, [camps, searchQuery, selectedStatus]);

  const loadCampRequests = async () => {
    try {
      setLoading(true);
      const campsData = await CampService.getAllCamps();
      setCamps(campsData);
    } catch (error) {
      console.error('Error loading camp requests:', error);
      Alert.alert('Error', 'Failed to load camp requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampRequests();
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

  const handleApproveCamp = async (campId) => {
    Alert.alert(
      'Approve Camp Request',
      'Are you sure you want to approve this camp request? This will confirm the time slot and notify the organizer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveCamp(campId) }
      ]
    );
  };

  const handleRejectCamp = async (campId) => {
    Alert.alert(
      'Reject Camp Request',
      'Are you sure you want to reject this camp request? The time slot will become available again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', onPress: () => rejectCamp(campId) }
      ]
    );
  };

  const approveCamp = async (campId) => {
    try {
      await CampService.updateCampStatus(campId, 'APPROVED', user.id, user.username);
      Alert.alert('Success', 'Camp request approved successfully!');
      loadCampRequests();
    } catch (error) {
      console.error('Error approving camp:', error);
      Alert.alert('Error', 'Failed to approve camp request. Please try again.');
    }
  };

  const rejectCamp = async (campId) => {
    try {
      await CampService.updateCampStatus(campId, 'REJECTED', user.id, user.username);
      Alert.alert('Success', 'Camp request rejected successfully!');
      loadCampRequests();
    } catch (error) {
      console.error('Error rejecting camp:', error);
      Alert.alert('Error', 'Failed to reject camp request. Please try again.');
    }
  };

  const handleViewDetails = (campId) => {
    navigation.navigate('CampDetails', { campId });
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

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderCampCard = (camp) => (
    <Card key={camp.id} style={styles.campCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.campName}>
              {camp.name}
            </Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(camp.status) }]}
              textStyle={styles.statusText}
            >
              {camp.status}
            </Chip>
          </View>
        </View>

        <View style={styles.campDetails}>
          <View style={styles.detailRow}>
            <Icon {...getIcon('location-outline', 16, Colors.gray[600])} />
            <Text variant="bodyMedium" style={styles.detailText}>
              {camp.location}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon {...getIcon('calendar-outline', 16, Colors.gray[600])} />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatDate(camp.startDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon {...getIcon('time-outline', 16, Colors.gray[600])} />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatTime(camp.startTime)} - {formatTime(camp.endTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon {...getIcon('person-outline', 16, Colors.gray[600])} />
            <Text variant="bodyMedium" style={styles.detailText}>
              Organizer: {camp.organizerName}
            </Text>
          </View>

          {camp.expectedDonors && (
            <View style={styles.detailRow}>
              <Icon {...getIcon('people-outline', 16, Colors.gray[600])} />
              <Text variant="bodyMedium" style={styles.detailText}>
                Expected Donors: {camp.expectedDonors}
              </Text>
            </View>
          )}
        </View>

        {camp.description && (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {camp.description}
          </Text>
        )}

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewDetails(camp.id)}
            style={styles.actionButton}
            compact
          >
            View Details
          </Button>

          {camp.status === 'PENDING' && (
            <>
              <Button
                mode="contained"
                onPress={() => handleApproveCamp(camp.id)}
                style={[styles.actionButton, styles.approveButton]}
                compact
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleRejectCamp(camp.id)}
                style={[styles.actionButton, styles.rejectButton]}
                textColor={Colors.error}
                compact
              >
                Reject
              </Button>
            </>
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
        <Text style={styles.loadingText}>Loading camp requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Camp Request Review
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Review and approve/reject camp requests
          </Text>
        </Card.Content>
      </Card>

      {/* Search and Filters */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search camp requests..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilter}
          >
            {statusOptions.map((status) => (
              <Chip
                key={status.key}
                selected={selectedStatus === status.key}
                onPress={() => setSelectedStatus(status.key)}
                style={[
                  styles.statusChip,
                  selectedStatus === status.key && { backgroundColor: status.color }
                ]}
                textStyle={[
                  styles.statusChipText,
                  selectedStatus === status.key && { color: Colors.white }
                ]}
              >
                {status.label}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Camp Requests List */}
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
              No camp requests found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {searchQuery || selectedStatus !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'No camp requests have been submitted yet'}
            </Text>
          </View>
        ) : (
          filteredCamps.map(renderCampCard)
        )}
      </ScrollView>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  filterCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 12,
  },
  statusFilter: {
    marginTop: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  statusChipText: {
    fontSize: 12,
  },
  campsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  campCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campName: {
    flex: 1,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  campDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: Colors.text.secondary,
  },
  description: {
    color: Colors.gray[600],
    marginBottom: 12,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    borderColor: Colors.error,
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
  },
  emptySubtitle: {
    marginTop: 8,
    color: Colors.gray[500],
    textAlign: 'center',
  },
});

export default AdminCampReviewScreen;
