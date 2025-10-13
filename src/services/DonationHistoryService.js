import ApiService from './ApiService';

class DonationHistoryService {
  /**
   * Get all donations with comprehensive filtering
   */
  async getAllDonationsWithFilters(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.donationType) params.append('donationType', filters.donationType);
      if (filters.status) params.append('status', filters.status);
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.phone) params.append('phone', filters.phone);
      if (filters.name) params.append('name', filters.name);
      if (filters.location) params.append('location', filters.location);
      if (filters.bloodBankName) params.append('bloodBankName', filters.bloodBankName);
      if (filters.eligibilityFilter) params.append('eligibilityFilter', filters.eligibilityFilter);
      if (filters.page !== undefined) params.append('page', filters.page);
      if (filters.size !== undefined) params.append('size', filters.size);

      const queryString = params.toString();
      const url = queryString ? `/donations/history?${queryString}` : '/donations/history';
      
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching donations with filters:', error);
      throw error;
    }
  }

  /**
   * Get donations by donor phone number
   */
  async getDonationsByPhone(phone) {
    try {
      return await ApiService.get(`/donations/history/phone/${encodeURIComponent(phone)}`);
    } catch (error) {
      console.error('Error fetching donations by phone:', error);
      throw error;
    }
  }

  /**
   * Get donations by donor name
   */
  async getDonationsByName(name) {
    try {
      return await ApiService.get(`/donations/history/name/${encodeURIComponent(name)}`);
    } catch (error) {
      console.error('Error fetching donations by name:', error);
      throw error;
    }
  }

  /**
   * Get donations by location
   */
  async getDonationsByLocation(location) {
    try {
      return await ApiService.get(`/donations/history/location/${encodeURIComponent(location)}`);
    } catch (error) {
      console.error('Error fetching donations by location:', error);
      throw error;
    }
  }

  /**
   * Get donations by blood bank
   */
  async getDonationsByBloodBank(bloodBankName) {
    try {
      return await ApiService.get(`/donations/history/blood-bank/${encodeURIComponent(bloodBankName)}`);
    } catch (error) {
      console.error('Error fetching donations by blood bank:', error);
      throw error;
    }
  }

  /**
   * Get donations by blood type
   */
  async getDonationsByBloodType(bloodType) {
    try {
      return await ApiService.get(`/donations/history/blood-type/${bloodType}`);
    } catch (error) {
      console.error('Error fetching donations by blood type:', error);
      throw error;
    }
  }

  /**
   * Get donations by donation type
   */
  async getDonationsByType(donationType) {
    try {
      return await ApiService.get(`/donations/history/type/${donationType}`);
    } catch (error) {
      console.error('Error fetching donations by type:', error);
      throw error;
    }
  }

  /**
   * Get donations by status
   */
  async getDonationsByStatus(status) {
    try {
      return await ApiService.get(`/donations/history/status/${status}`);
    } catch (error) {
      console.error('Error fetching donations by status:', error);
      throw error;
    }
  }

  /**
   * Get donations by date range
   */
  async getDonationsByDateRange(startDate, endDate) {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      return await ApiService.get(`/donations/history/date-range?${params.toString()}`);
    } catch (error) {
      console.error('Error fetching donations by date range:', error);
      throw error;
    }
  }

  /**
   * Get recent donations (last 30 days)
   */
  async getRecentDonations() {
    try {
      return await ApiService.get('/donations/history/recent');
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      throw error;
    }
  }

  /**
   * Get donation statistics
   */
  async getDonationStatistics(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = queryString ? `/donations/history/statistics?${queryString}` : '/donations/history/statistics';
      
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching donation statistics:', error);
      throw error;
    }
  }

  /**
   * Get available filter options
   */
  async getFilterOptions() {
    try {
      return await ApiService.get('/donations/history/filter-options');
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }

  /**
   * Format date for API calls
   */
  formatDateForAPI(date) {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Format blood type for display
   */
  formatBloodType(bloodType) {
    if (!bloodType) return 'N/A';
    return bloodType.replace('_', '+');
  }

  /**
   * Format donation type for display
   */
  formatDonationType(donationType) {
    if (!donationType) return 'N/A';
    return donationType.replace('_', ' ');
  }

  /**
   * Get eligibility status text
   */
  getEligibilityStatus(donation) {
    if (!donation.nextEligibleDate) return 'Unknown';
    
    const today = new Date();
    const eligibleDate = new Date(donation.nextEligibleDate);
    
    if (eligibleDate > today) {
      return 'Eligible';
    } else {
      return 'Expired';
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status) {
    switch (status) {
      case 'COMPLETED':
        return '#22c55e'; // Green
      case 'DEFERRED':
        return '#f59e0b'; // Amber
      case 'CANCELLED':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  /**
   * Get eligibility color for UI
   */
  getEligibilityColor(donation) {
    const status = this.getEligibilityStatus(donation);
    switch (status) {
      case 'Eligible':
        return '#22c55e'; // Green
      case 'Expired':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }
}

export default new DonationHistoryService();
