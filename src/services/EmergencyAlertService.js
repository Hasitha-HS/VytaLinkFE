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
      return await ApiService.post('/api/emergency-alerts', payload);
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
      const url = queryString ? `/api/emergency-alerts?${queryString}` : '/api/emergency-alerts';
      return await ApiService.get(url);
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      throw error;
    }
  }

  // Get emergency alert by ID
  async getAlertById(alertId) {
    try {
      return await ApiService.get(`/api/emergency-alerts/${alertId}`);
    } catch (error) {
      console.error('Error fetching emergency alert:', error);
      throw error;
    }
  }

  // Respond to emergency alert
  async respondToAlert(alertId, donorId, response) {
    try {
      const payload = {
        donorId: parseInt(donorId),
        response: response
      };
      return await ApiService.post(`/api/emergency-alerts/${alertId}/respond`, payload);
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  // Cancel emergency alert
  async cancelAlert(alertId) {
    try {
      return await ApiService.post(`/api/emergency-alerts/${alertId}/cancel`);
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
      return await ApiService.post(`/api/emergency-alerts/${alertId}/confirm-donor`, payload);
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
}

export default new EmergencyAlertService();
