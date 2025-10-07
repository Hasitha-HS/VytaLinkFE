import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';
import { STORAGE_KEYS } from '../utils/Constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize push notifications
  async initialize() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        } catch (permissionError) {
          console.warn('Permission request failed:', permissionError.message);
          // Continue without notifications if permission fails
          return null;
        }
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const token = await this.getExpoPushToken();
      
      if (token) {
        // Store token locally
        await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
        console.log('Push token obtained:', token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return token;
    } catch (error) {
      console.warn('Error initializing notifications:', error.message);
      // Don't throw error, just return null to continue app functionality
      return null;
    }
  }

  // Get Expo push token
  async getExpoPushToken() {
    try {
      // Try to get project ID from various sources
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                       Constants.manifest?.extra?.eas?.projectId ||
                       process.env.EXPO_PROJECT_ID;
      
      if (!projectId) {
        console.warn('No Expo project ID found. Push notifications may not work properly.');
        console.warn('Please set up your app.config.js with a valid project ID.');
        // For development, we can still try to get a token without project ID
        // but this will show the deprecation warning
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
      return token;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const { title, body, data } = notification.request.content;
    
    // Handle different types of notifications
    if (data?.type === 'emergency_alert') {
      // Emergency blood request notification
      console.log('Emergency alert received:', data);
    } else if (data?.type === 'appointment_reminder') {
      // Appointment reminder
      console.log('Appointment reminder:', data);
    }
  }

  // Handle notification response (user tapped notification)
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    if (data?.type === 'emergency_alert') {
      // Navigate to emergency alert details
      // This would be handled by navigation service
      console.log('Navigate to emergency alert:', data.alertId);
    }
  }

  // Send test notification
  async sendTestNotification(notificationData) {
    try {
      const payload = {
        title: notificationData.title,
        body: notificationData.body,
        fcmToken: notificationData.fcmToken,
        data: notificationData.data || {},
        imageUrl: notificationData.imageUrl,
        clickAction: notificationData.clickAction,
        sound: notificationData.sound || 'default',
        badge: notificationData.badge
      };
      
      return await ApiService.post('/notifications/test', payload);
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(title, body, scheduledTime, data = {}) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: {
          date: new Date(scheduledTime),
        },
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permissions status:', error);
      return 'undetermined';
    }
  }

  // Update FCM token on server
  async updateFcmTokenOnServer(donorId) {
    try {
      const fcmToken = await AsyncStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
      if (fcmToken && donorId) {
        // Call your API to update FCM token
        await ApiService.put(`/donors/${donorId}/fcm-token`, { fcmToken });
        console.log('FCM token updated on server');
      }
    } catch (error) {
      console.error('Error updating FCM token on server:', error);
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get notification history
  async getNotificationHistory() {
    try {
      // Note: This might need to be implemented in your backend
      return await ApiService.get('/notifications/history');
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      // Note: This might need to be implemented in your backend
      return await ApiService.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();


