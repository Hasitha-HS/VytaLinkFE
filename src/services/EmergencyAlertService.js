import ApiService from './ApiService';

class EmergencyAlertService {
  // Create emergency alert
  async createAlert(alertData) {
    try {
      const payload = {
        bloodType: alertData.bloodType,
        unitsNeeded: parseInt(alertData.unitsNeeded),
        urgencyLevel: alertData.urgencyLevel,
        hospitalName: alertData.hospitalName,
        patientName: alertData.patientName,
        message: alertData.message,
        requiredBy: alertData.requiredBy
      };
      return await ApiService.post('/emergency-alerts', payload);
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  // Get all emergency alerts with filtering
  async getAllAlerts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.urgencyLevel) params.append('urgencyLevel', filters.urgencyLevel);
      
      const queryString = params.toString();
      const url = queryString ? `/emergency-alerts?${queryString}` : '/emergency-alerts';
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      throw error;
    }
  }

  // Get emergency alert by ID
  async getAlertById(alertId) {
    try {
      return await ApiService.get(`/emergency-alerts/${alertId}`);
    } catch (error) {
      console.error('Error fetching emergency alert:', error);
      throw error;
    }
  }

  // Alias for getAlertById for consistency
  async getAlertDetails(alertId) {
    return await this.getAlertById(alertId);
  }

  // Respond to emergency alert
  async respondToAlert(alertId, donorId, response) {
    try {
      const params = {
        donorId: parseInt(donorId),
        response: response
      };
      return await ApiService.post(`/emergency-alerts/${alertId}/respond`, null, { params });
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  // Cancel emergency alert
  async cancelAlert(alertId) {
    try {
      return await ApiService.post(`/emergency-alerts/${alertId}/cancel`);
    } catch (error) {
      console.error('Error cancelling alert:', error);
      throw error;
    }
  }

  // Confirm donor for alert
  async confirmDonor(alertId, donorId, appointmentTime, notes) {
    try {
      const payload = {
        donorId: parseInt(donorId),
        appointmentTime: appointmentTime,
        notes: notes
      };
      return await ApiService.post(`/emergency-alerts/${alertId}/confirm-donor`, payload);
    } catch (error) {
      console.error('Error confirming donor:', error);
      throw error;
    }
  }

  // Get active alerts for donors
  async getActiveAlerts() {
    try {
      console.log('EmergencyAlertService.getActiveAlerts called');
      const result = await this.getAllAlerts({ status: 'ACTIVE' });
      console.log('EmergencyAlertService.getActiveAlerts result:', result);
      return result;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  // Get alerts by blood type
  async getAlertsByBloodType(bloodType) {
    try {
      return await this.getAllAlerts({ bloodType: bloodType });
    } catch (error) {
      console.error('Error fetching alerts by blood type:', error);
      throw error;
    }
  }

  // Get donor responses for an alert (from the alert details endpoint)
  async getAlertResponses(alertId) {
    try {
      const alertData = await this.getAlertById(alertId);
      return alertData.responses || [];
    } catch (error) {
      console.error('Error fetching alert responses:', error);
      throw error;
    }
  }

  // Get alert statistics (response counts from the alert details endpoint)
  async getAlertStats(alertId) {
    try {
      const alertData = await this.getAlertById(alertId);
      return alertData.responseCount || {
        accepted: 0,
        declined: 0,
        pending: 0
      };
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      throw error;
    }
  }

  // Send reminder to donors
  async sendReminder(alertId, message) {
    try {
      return await ApiService.post(`/emergency-alerts/${alertId}/send-reminder`, null, {
        params: { message }
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // Get detailed alert responses
  async getDetailedAlertResponses(alertId) {
    try {
      return await ApiService.get(`/emergency-alerts/${alertId}/responses`);
    } catch (error) {
      console.error('Error fetching detailed alert responses:', error);
      throw error;
    }
  }

  // Get detailed alert statistics
  async getDetailedAlertStats(alertId) {
    try {
      return await ApiService.get(`/emergency-alerts/${alertId}/stats`);
    } catch (error) {
      console.error('Error fetching detailed alert stats:', error);
      throw error;
    }
  }
}

export default new EmergencyAlertService();
