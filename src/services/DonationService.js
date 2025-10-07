import ApiService from './ApiService';

class DonationService {
  // Get donation history for a donor
  async getDonationHistory(donorId) {
    try {
      return await ApiService.get(`/donations/donor/${donorId}`);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw error;
    }
  }

  // Get all donations (admin/staff only)
  async getAllDonations(params = {}) {
    try {
      return await ApiService.get('/donations', params);
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  }

  // Create a new donation record
  async createDonation(donationData) {
    try {
      return await ApiService.post('/donations', donationData);
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  // Update donation status
  async updateDonationStatus(donationId, status) {
    try {
      return await ApiService.put(`/donations/${donationId}/status`, { status });
    } catch (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }
  }

  // Get donation statistics
  async getDonationStats() {
    try {
      return await ApiService.get('/donations/stats');
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      throw error;
    }
  }

  // Get donations by blood type
  async getDonationsByBloodType(bloodType) {
    try {
      return await ApiService.get('/donations', { bloodType });
    } catch (error) {
      console.error('Error fetching donations by blood type:', error);
      throw error;
    }
  }

  // Get recent donations
  async getRecentDonations(limit = 10) {
    try {
      return await ApiService.get('/donations', { limit, sort: 'createdAt', order: 'desc' });
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      throw error;
    }
  }
}

export default new DonationService();
