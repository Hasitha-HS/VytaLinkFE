import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';
import { STORAGE_KEYS } from '../utils/Constants';

class AuthService {
  // Login user
  async login(username, password) {
    try {
      const payload = {
        username,
        password
      };
      const response = await ApiService.post('/api/auth/login', payload);
      
      if (response.token) {
        // Store token and user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint
      await ApiService.post('/api/auth/logout');
      
      // Clear stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.FCM_TOKEN
      ]);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.FCM_TOKEN
      ]);
      throw error;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Get current user data
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Refresh token (if your API supports it)
  async refreshToken() {
    try {
      const currentToken = await this.getToken();
      if (!currentToken) {
        throw new Error('No token found');
      }

      // Note: This endpoint might not exist in your current API
      // You may need to add it to your Spring Boot backend
      const response = await ApiService.post('/auth/refresh');
      
      if (response.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Validate current session
  async validateSession() {
    try {
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      // Note: This endpoint might not exist in your current API
      // You may need to add it to your Spring Boot backend
      await ApiService.get('/auth/validate');
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      // If validation fails, clear stored data
      await this.logout();
      return false;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'USER',
        bloodBankId: userData.bloodBankId
      };
      
      const response = await ApiService.post('/api/auth/register', payload);
      
      if (response.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, response.token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('User registration error:', error);
      throw error;
    }
  }


  // Forgot password
  async forgotPassword(email) {
    try {
      const payload = { email };
      // Note: This endpoint might not exist in your current API
      return await ApiService.post('/auth/forgot-password', payload);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const payload = {
        token,
        newPassword
      };
      // Note: This endpoint might not exist in your current API
      return await ApiService.post('/auth/reset-password', payload);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile() {
    try {
      return await ApiService.get('/api/auth/profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const payload = {
        currentPassword,
        newPassword
      };
      return await ApiService.post('/api/auth/change-password', payload);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Get all users (Admin only)
  async getAllUsers() {
    try {
      return await ApiService.get('/api/auth/users');
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Deactivate user (Admin only)
  async deactivateUser(userId) {
    try {
      return await ApiService.post(`/api/auth/users/${userId}/deactivate`);
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Activate user (Admin only)
  async activateUser(userId) {
    try {
      return await ApiService.post(`/api/auth/users/${userId}/activate`);
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  }
}

export default new AuthService();


