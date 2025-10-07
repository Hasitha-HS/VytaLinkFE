import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/Constants';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.log('Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          await AsyncStorage.multiRemove([STORAGE_KEYS.USER_TOKEN, STORAGE_KEYS.USER_DATA]);
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // GET request
  async get(endpoint, params = {}) {
    try {
      console.log('ApiService.get called with endpoint:', endpoint, 'params:', params);
      const response = await this.api.get(endpoint, { params });
      console.log('ApiService.get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ApiService.get error:', error);
      throw this.handleError(error);
    }
  }

  // POST request
  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete(endpoint, config = {}) {
    try {
      const response = await this.api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    // Axios timeout
    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timed out. Please try again.',
        status: 0,
      };
    }

    if (error.response) {
      const status = error.response.status;
      const serverMessage =
        error.response.data?.message || error.response.data?.error || null;

      let friendlyMessage = serverMessage;
      switch (status) {
        case 400:
          friendlyMessage = serverMessage || 'Bad request. Please check inputs.';
          break;
        case 401:
          {
            const requestUrl = error.config?.url || '';
            if (requestUrl.includes('/auth/login')) {
              // Prefer backend message if present; otherwise show generic
              friendlyMessage = serverMessage || 'Invalid username or password.';
            } else {
              friendlyMessage = serverMessage || 'Your session is invalid or expired. Please sign in.';
            }
          }
          break;
        case 403:
          friendlyMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          friendlyMessage = 'Requested resource was not found.';
          break;
        case 409:
          friendlyMessage = serverMessage || 'Conflict detected. Please try again.';
          break;
        case 422:
          friendlyMessage = serverMessage || 'Validation failed. Please review the form.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          friendlyMessage = 'Server error. Please try again later.';
          break;
        default:
          friendlyMessage = serverMessage || 'Unexpected error occurred.';
      }

      return {
        message: friendlyMessage,
        status,
        data: error.response.data,
      };
    }

    if (error.request) {
      // Request was made but no response
      return {
        message: 'Cannot reach server. Check your internet or server address.',
        status: 0,
      };
    }

    // Something else happened setting up the request
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1,
    };
  }
}

export default new ApiService();


