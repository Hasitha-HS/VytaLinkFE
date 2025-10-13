import ApiService from './ApiService';

class CampService {
  // Get all camps
  async getAllCamps() {
    try {
      return await ApiService.get('/camps');
    } catch (error) {
      console.error('Error fetching camps:', error);
      throw error;
    }
  }

  // Get camp by ID
  async getCampById(campId) {
    try {
      return await ApiService.get(`/camps/${campId}`);
    } catch (error) {
      console.error('Error fetching camp details:', error);
      throw error;
    }
  }

  // Create new camp
  async createCamp(campData) {
    try {
      return await ApiService.post('/camps', campData);
    } catch (error) {
      console.error('Error creating camp:', error);
      throw error;
    }
  }

  // Update camp
  async updateCamp(campId, campData) {
    try {
      return await ApiService.put(`/camps/${campId}`, campData);
    } catch (error) {
      console.error('Error updating camp:', error);
      throw error;
    }
  }

  // Update camp status (for admin review)
  async updateCampStatus(campId, status, reviewedBy) {
    try {
      return await ApiService.put(`/camps/${campId}/status`, {
        status,
        reviewedBy
      });
    } catch (error) {
      console.error('Error updating camp status:', error);
      throw error;
    }
  }

  // Delete camp
  async deleteCamp(campId) {
    try {
      return await ApiService.delete(`/camps/${campId}`);
    } catch (error) {
      console.error('Error deleting camp:', error);
      throw error;
    }
  }

  // Get camps by organizer
  async getCampsByOrganizer(organizerId) {
    try {
      return await ApiService.get(`/camps/organizer/${organizerId}`);
    } catch (error) {
      console.error('Error fetching organizer camps:', error);
      throw error;
    }
  }

  // Get camps by status
  async getCampsByStatus(status) {
    try {
      return await ApiService.get(`/camps/status/${status}`);
    } catch (error) {
      console.error('Error fetching camps by status:', error);
      throw error;
    }
  }

  // Search camps
  async searchCamps(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };
      return await ApiService.get('/camps/search', params);
    } catch (error) {
      console.error('Error searching camps:', error);
      throw error;
    }
  }

  // Get camp statistics
  async getCampStats() {
    try {
      return await ApiService.get('/camps/stats');
    } catch (error) {
      console.error('Error fetching camp statistics:', error);
      throw error;
    }
  }

  // Get upcoming camps
  async getUpcomingCamps(limit = 10) {
    try {
      return await ApiService.get(`/camps/upcoming?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching upcoming camps:', error);
      throw error;
    }
  }

  // Register for camp (for donors)
  async registerForCamp(campId, donorId) {
    try {
      return await ApiService.post(`/camps/${campId}/register`, {
        donorId
      });
    } catch (error) {
      console.error('Error registering for camp:', error);
      throw error;
    }
  }

  // Get camp registrations
  async getCampRegistrations(campId) {
    try {
      return await ApiService.get(`/camps/${campId}/registrations`);
    } catch (error) {
      console.error('Error fetching camp registrations:', error);
      throw error;
    }
  }

  // Cancel camp registration
  async cancelCampRegistration(campId, donorId) {
    try {
      return await ApiService.delete(`/camps/${campId}/registrations/${donorId}`);
    } catch (error) {
      console.error('Error canceling camp registration:', error);
      throw error;
    }
  }

  // Get available dates for camp scheduling
  async getAvailableDates(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/camps/availability/dates?${queryString}` : '/camps/availability/dates';
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw error;
    }
  }

  // Get available time slots for a specific date
  async getAvailableTimeSlots(date) {
    try {
      return await ApiService.get(`/camps/availability/timeslots?date=${date}`);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }

  // Check if a specific time slot is available
  async checkTimeSlotAvailability(date, startTime, endTime) {
    try {
      const params = new URLSearchParams({
        date,
        startTime,
        endTime
      });
      return await ApiService.get(`/camps/availability/check?${params.toString()}`);
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw error;
    }
  }
}

export default new CampService();
