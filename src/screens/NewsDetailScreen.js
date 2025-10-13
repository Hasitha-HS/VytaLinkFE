import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Button
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/Colors';
import NewsService from '../services/NewsService';

const { width } = Dimensions.get('window');

const NewsDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { newsId } = route.params;

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewsDetail();
  }, [newsId]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      const newsData = await NewsService.getNewsById(newsId);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news detail:', error);
      Alert.alert('Error', 'Failed to load news article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleLarge" style={styles.errorTitle}>
          Article Not Found
        </Text>
        <Text variant="bodyMedium" style={styles.errorMessage}>
          The requested news article could not be found.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: news.imageUrl }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon="arrow-left"
            compact
          >
            Back
          </Button>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text variant="headlineMedium" style={styles.title}>
          {news.title}
        </Text>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <Text variant="bodyMedium" style={styles.date}>
            📅 {formatDate(news.createdAt)}
          </Text>
          {news.createdByName && (
            <Text variant="bodyMedium" style={styles.author}>
              ✍️ {news.createdByName}
            </Text>
          )}
        </View>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.descriptionTitle}>
              Summary
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {news.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Extended Description */}
        <Card style={styles.contentCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.contentTitle}>
              Full Article
            </Text>
            <Text variant="bodyLarge" style={styles.extendedDescription}>
              {news.extendedDescription}
            </Text>
          </Card.Content>
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorTitle: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  headerImage: {
    width: width,
    height: 250,
  },
  imageOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  date: {
    color: Colors.gray[600],
  },
  author: {
    color: Colors.gray[600],
  },
  descriptionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  descriptionTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  description: {
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  contentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  contentTitle: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  extendedDescription: {
    color: Colors.text.primary,
    lineHeight: 26,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default NewsDetailScreen;
