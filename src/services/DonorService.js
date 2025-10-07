import ApiService from './ApiService';

class DonorService {
  // Register new donor
  async registerDonor(donorData) {
    try {
      const payload = {
        name: donorData.firstName && donorData.lastName 
          ? `${donorData.firstName} ${donorData.lastName}`.trim()
          : donorData.name,
        age: parseInt(donorData.age) || 25,
        gender: donorData.gender || 'OTHER',
        bloodType: donorData.bloodType || 'O_POSITIVE',
        phone: donorData.phoneNumber || donorData.phone,
        email: donorData.email,
        address: donorData.address || 'Not provided',
        weight: donorData.weight ? parseFloat(donorData.weight) : null
      };
      return await ApiService.post('/donors/register', payload);
    } catch (error) {
      console.error('Error registering donor:', error);
      throw error;
    }
  }

  // Get all donors with filtering
  async getAllDonors(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.eligibilityStatus) params.append('eligibilityStatus', filters.eligibilityStatus);
      if (filters.page) params.append('page', filters.page);
      if (filters.size) params.append('size', filters.size);
      
      const queryString = params.toString();
      const url = queryString ? `/donors?${queryString}` : '/donors';
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching all donors:', error);
      throw error;
    }
  }

  // Get donor by ID
  async getDonorById(donorId) {
    try {
      return await ApiService.get(`/donors/${donorId}`);
    } catch (error) {
      console.error('Error fetching donor by ID:', error);
      throw error;
    }
  }

  // Get donor by phone number
  async getDonorByPhone(phoneNumber) {
    try {
      return await ApiService.get(`/donors/phone/${phoneNumber}`);
    } catch (error) {
      console.error('Error fetching donor by phone:', error);
      throw error;
    }
  }

  // Get donor by user ID
  async getDonorByUserId(userId) {
    try {
      return await ApiService.get(`/donors/user/${userId}`);
    } catch (error) {
      console.error('Error fetching donor by user ID:', error);
      throw error;
    }
  }

  // Update donor FCM token
  async updateFcmToken(donorId, fcmToken) {
    try {
      const params = { fcmToken };
      return await ApiService.put(`/api/donors/${donorId}/fcm-token`, null, { params });
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  }

  // Update donor profile
  async updateDonorProfile(donorId, updateData) {
    try {
      const payload = {
        name: updateData.name,
        age: updateData.age ? parseInt(updateData.age) : null,
        gender: updateData.gender,
        bloodType: updateData.bloodType,
        phone: updateData.phone,
        email: updateData.email,
        address: updateData.address,
        weight: updateData.weight ? parseFloat(updateData.weight) : null
      };
      return await ApiService.put(`/donors/${donorId}`, payload);
    } catch (error) {
      console.error('Error updating donor profile:', error);
      throw error;
    }
  }

  // Check donor eligibility
  async checkDonorEligibility(donorId) {
    try {
      // Note: This endpoint might not exist in your current API
      // You may need to add it to your Spring Boot backend
      return await ApiService.get(`/donors/${donorId}/eligibility`);
    } catch (error) {
      console.error('Error checking donor eligibility:', error);
      throw error;
    }
  }

  // Get donor donation history
  async getDonorHistory(donorId) {
    try {
      // Note: This endpoint might not exist in your current API
      // You may need to add it to your Spring Boot backend
      return await ApiService.get(`/donors/${donorId}/history`);
    } catch (error) {
      console.error('Error fetching donor history:', error);
      throw error;
    }
  }

  // Search donors by criteria
  async searchDonors(criteria) {
    try {
      const params = new URLSearchParams();
      if (criteria.query) params.append('q', criteria.query);
      if (criteria.bloodType) params.append('bloodType', criteria.bloodType);
      if (criteria.eligibilityStatus) params.append('eligibilityStatus', criteria.eligibilityStatus);
      if (criteria.page) params.append('page', criteria.page);
      if (criteria.size) params.append('size', criteria.size);
      
      const queryString = params.toString();
      const url = queryString ? `/donors/search?${queryString}` : '/donors/search';
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error searching donors:', error);
      throw error;
    }
  }

  // Get donor contact information
  async getDonorContact(donorId) {
    try {
      return await ApiService.get(`/donors/${donorId}/contact`);
    } catch (error) {
      console.error('Error fetching donor contact:', error);
      throw error;
    }
  }

  // Send FCM notification to donor
  async sendMessageToDonor(donorId, message, type, alertId = null) {
    try {
      const payload = { message, type };
      if (alertId) payload.alertId = alertId;
      
      return await ApiService.post(`/donors/${donorId}/message`, payload);
    } catch (error) {
      console.error('Error sending FCM notification to donor:', error);
      throw error;
    }
  }

  // Get donor donation history (updated method)
  async getDonorDonations(donorId, page = 0, size = 10) {
    try {
      return await ApiService.get(`/donors/${donorId}/donations?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Error fetching donor donations:', error);
      throw error;
    }
  }

  // Check donor eligibility for specific alert
  async checkDonorEligibilityForAlert(donorId, alertId) {
    try {
      return await ApiService.get(`/donors/${donorId}/eligibility/${alertId}`);
    } catch (error) {
      console.error('Error checking donor eligibility for alert:', error);
      throw error;
    }
  }

  // Update donor status
  async updateDonorStatus(donorId, status, reason) {
    try {
      return await ApiService.put(`/donors/${donorId}/status`, {
        eligibilityStatus: status,
        reason: reason
      });
    } catch (error) {
      console.error('Error updating donor status:', error);
      throw error;
    }
  }
}

export default new DonorService();


