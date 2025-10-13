import React, { useState, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  HelperText
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../utils/Colors';
import NewsService from '../services/NewsService';

const NewsCreationScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    extendedDescription: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (!formData.extendedDescription.trim()) {
      newErrors.extendedDescription = 'Extended description is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      
      await NewsService.createNews(formData);
      
      Alert.alert(
        'Success',
        'News article created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating news:', error);
      Alert.alert('Error', 'Failed to create news article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Create News Article
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Share important updates and announcements
          </Text>
        </View>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Article Information
            </Text>
            
            <TextInput
              label="Title *"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              error={!!errors.title}
              style={styles.input}
              mode="outlined"
              placeholder="Enter article title"
            />
            <HelperText type="error" visible={!!errors.title}>
              {errors.title}
            </HelperText>

            <TextInput
              label="Short Description *"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={!!errors.description}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Brief summary for home screen (max 500 characters)"
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>

            <TextInput
              label="Image URL *"
              value={formData.imageUrl}
              onChangeText={(value) => handleInputChange('imageUrl', value)}
              error={!!errors.imageUrl}
              style={styles.input}
              mode="outlined"
              placeholder="https://imgur.com/your-image-url"
            />
            <HelperText type="error" visible={!!errors.imageUrl}>
              {errors.imageUrl}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Extended Content */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Full Article Content
            </Text>
            
            <TextInput
              label="Extended Description *"
              value={formData.extendedDescription}
              onChangeText={(value) => handleInputChange('extendedDescription', value)}
              error={!!errors.extendedDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={8}
              placeholder="Write the full article content here..."
            />
            <HelperText type="error" visible={!!errors.extendedDescription}>
              {errors.extendedDescription}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            icon="check"
          >
            Create News Article
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  submitContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
});

export default NewsCreationScreen;
