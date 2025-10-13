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
  FAB,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import NewsService from '../services/NewsService';

const NewsManagementScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await NewsService.getAllNews();
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleCreateNews = () => {
    navigation.navigate('NewsCreation');
  };

  const handleEditNews = (newsId) => {
    navigation.navigate('NewsEdit', { newsId });
  };

  const handleDeleteNews = (newsId, title) => {
    Alert.alert(
      'Delete News',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(newsId) }
      ]
    );
  };

  const confirmDelete = async (newsId) => {
    try {
      await NewsService.deleteNews(newsId);
      Alert.alert('Success', 'News article deleted successfully!');
      loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      Alert.alert('Error', 'Failed to delete news. Please try again.');
    }
  };

  const handleViewNews = (newsId) => {
    navigation.navigate('NewsDetail', { newsId });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNewsCard = (article) => (
    <Card key={article.id} style={styles.newsCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text variant="titleMedium" style={styles.newsTitle} numberOfLines={2}>
              {article.title}
            </Text>
            <Text variant="bodySmall" style={styles.newsDate}>
              {formatDate(article.createdAt)}
            </Text>
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.newsDescription} numberOfLines={3}>
          {article.description}
        </Text>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => handleViewNews(article.id)}
            style={styles.actionButton}
            compact
          >
            View
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleEditNews(article.id)}
            style={styles.actionButton}
            compact
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleDeleteNews(article.id, article.title)}
            style={[styles.actionButton, styles.deleteButton]}
            textColor={Colors.error}
            compact
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            News Management
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Manage news articles and announcements
          </Text>
        </Card.Content>
      </Card>

      {/* Search */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search news articles..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Card.Content>
      </Card>

      {/* News List */}
      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredNews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon {...getIcon('newspaper-outline', 64, Colors.gray[400])} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              {searchQuery ? 'No news found' : 'No news articles yet'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first news article to get started'
              }
            </Text>
          </View>
        ) : (
          filteredNews.map(renderNewsCard)
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateNews}
        label="Create News"
      />
    </View>
  );
};

const getIcon = (iconName, size, color) => ({
  name: iconName,
  size,
  color,
  type: 'Ionicons'
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
  searchCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  searchBar: {
    marginBottom: 0,
  },
  newsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  newsCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  newsTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  newsDate: {
    color: Colors.gray[500],
  },
  newsDescription: {
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
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
  deleteButton: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default NewsManagementScreen;
