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
      console.log('Checking auth state...');
      setIsLoading(true);
      
      // Check if user is logged in
      const isLoggedIn = await AuthService.isLoggedIn();
      console.log('Is logged in:', isLoggedIn);
      
      if (isLoggedIn) {
        // Get stored user data
        const userData = await AuthService.getCurrentUser();
        console.log('User data:', userData);
        
        if (userData) {
          setUser(userData);
          
          // Initialize notifications
          try {
            await initializeNotifications(userData.id);
          } catch (notifError) {
            console.warn('Notification initialization failed:', notifError);
            // Don't fail the entire auth check if notifications fail
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Set user to null on error
      setUser(null);
    } finally {
      console.log('Setting isLoading to false');
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
        // For donor login, we might need to fetch additional donor data
        let userData = response;
        
        if (response.role === 'DONOR') {
          try {
            // Try to get donor details by phone or ID
            const donorData = await DonorService.getDonorById(response.id);
            userData = { ...response, ...donorData };
          } catch (error) {
            console.log('Could not fetch donor details:', error);
          }
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


