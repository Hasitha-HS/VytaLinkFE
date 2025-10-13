import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import DonorService from '../services/DonorService';
import NotificationService from '../services/NotificationService';
import { STORAGE_KEYS } from '../utils/Constants';

export const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  register: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AuthProvider rendering, isLoading:', isLoading, 'user:', user);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      setIsLoading(true);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 3000)
      );

      const authCheckPromise = async () => {
        console.log('📱 Checking if user is logged in...');
        // Check if user is logged in
        const isLoggedIn = await AuthService.isLoggedIn();
        console.log('✅ Is logged in:', isLoggedIn);

        if (isLoggedIn) {
          console.log('👤 Getting stored user data...');
          // Get stored user data
          let userData = await AuthService.getCurrentUser();
          console.log('📋 User data:', userData);

          if (userData) {
            // Try to fetch donor information
            try {
              console.log('🩸 Checking for donor information...');
              const donorData = await DonorService.getDonorByEmail(userData.email);
              userData = { ...userData, ...donorData };
              console.log('✅ Donor information loaded for user:', userData.name);
            } catch (error) {
              console.log('ℹ️ User is not a registered donor:', error.message);
              // User is not a donor, keep original user data
            }

            console.log('🎉 Setting user data');
            setUser(userData);

            // Initialize notifications
            try {
              console.log('🔔 Initializing notifications...');
              await initializeNotifications(userData.id);
            } catch (notifError) {
              console.warn('⚠️ Notification initialization failed:', notifError);
              // Don't fail the entire auth check if notifications fail
            }
          } else {
            console.log('❌ No user data found');
          }
        } else {
          console.log('🚫 User not logged in');
        }
      };

      await Promise.race([authCheckPromise(), timeoutPromise]);
    } catch (error) {
      console.error('💥 Error checking auth state:', error);
      // Set user to null on error
      setUser(null);
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const initializeNotifications = async (userId) => {
    try {
      console.log('Initializing notifications for user:', userId);
      // Initialize push notifications
      const fcmToken = await NotificationService.initialize();
      console.log('FCM token received:', fcmToken);
      
      if (fcmToken && userId) {
        // Update FCM token on server
        await NotificationService.updateFcmTokenOnServer(userId);
        console.log('FCM token updated on server');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // Don't throw error, just log it
    }
  };

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      
      // Authenticate user
      const response = await AuthService.login(username, password);
      
      if (response.token) {
        // Try to fetch donor information for any user
        let userData = response;
        
        try {
          // Try to get donor details by email
          const donorData = await DonorService.getDonorByEmail(response.email);
          userData = { ...response, ...donorData };
          console.log('✅ Donor information loaded for user:', userData.name);
        } catch (error) {
          console.log('ℹ️ User is not a registered donor:', error.message);
          // User is not a donor, keep original user data
        }
        
        setUser(userData);
        
        // Initialize notifications
        await initializeNotifications(userData.id);
        
        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Cleanup notifications
      NotificationService.cleanup();
      
      // Clear user state
      setUser(null);
      
      // Note: AuthService.logout() is called from the component
      // to handle any API errors gracefully
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      // Update user data locally
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      // If this is a donor, update on server
      if (user.role === 'DONOR' && user.id) {
        try {
          await DonorService.updateDonorProfile(user.id, updatedData);
        } catch (error) {
          console.error('Error updating donor profile on server:', error);
          // Don't throw error, keep local update
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { 
        success: false, 
        message: 'Failed to update profile. Please try again.' 
      };
    }
  };

  const register = async (registrationData) => {
    try {
      setIsLoading(true);
      
      // Register user for authentication
      const userResponse = await AuthService.register(registrationData);
      
      if (userResponse.token) {
        // Registration successful - auto-login
        const userData = {
          id: userResponse.id,
          username: userResponse.username,
          email: userResponse.email,
          role: userResponse.role,
          token: userResponse.token,
          ...userResponse
        };
        
        setUser(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        await initializeNotifications(userData.id);
        
        return { success: true, user: userData };
      } else {
        // Registration successful but need to sign in manually
        return { 
          success: true, 
          message: 'Registration successful! Please sign in with your username and password.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      if (user && user.role === 'DONOR' && user.id) {
        const donorData = await DonorService.getDonorById(user.id);
        const updatedUser = { ...user, ...donorData };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    register,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


