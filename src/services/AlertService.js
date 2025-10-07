import ApiService from './ApiService';

class AlertService {
  // Get all active emergency alerts
  async getActiveAlerts() {
    try {
      return await ApiService.get('/emergency-alerts');
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  // Get alert details by ID
  async getAlertDetails(alertId) {
    try {
      return await ApiService.get(`/emergency-alerts/${alertId}`);
    } catch (error) {
      console.error('Error fetching alert details:', error);
      throw error;
    }
  }

  // Create new emergency alert
  async createEmergencyAlert(alertData) {
    try {
      const payload = {
        bloodType: alertData.bloodType,
        unitsNeeded: alertData.unitsNeeded,
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

  // Respond to emergency alert
  async respondToAlert(alertId, donorId, response) {
    try {
      const params = {
        donorId,
        response // 'ACCEPTED', 'DECLINED', 'NO_RESPONSE'
      };
      return await ApiService.post(`/emergency-alerts/${alertId}/respond`, null, { params });
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  // Confirm donor for appointment
  async confirmDonor(responseId, appointmentDate, appointmentTime) {
    try {
      const params = {
        appointmentDate,
        appointmentTime
      };
      return await ApiService.post(`/emergency-alerts/responses/${responseId}/confirm`, null, { params });
    } catch (error) {
      console.error('Error confirming donor:', error);
      throw error;
    }
  }

  // Test emergency notification
  async testEmergencyNotification(fcmToken, bloodType = 'O_POSITIVE') {
    try {
      const params = {
        fcmToken,
        bloodType
      };
      return await ApiService.post('/notifications/test/emergency', null, { params });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Simulate emergency for testing
  async simulateEmergency() {
    try {
      return await ApiService.post('/test/simulate-emergency');
    } catch (error) {
      console.error('Error simulating emergency:', error);
      throw error;
    }
  }

  // Get eligible donors for blood type
  async getEligibleDonors(bloodType) {
    try {
      return await ApiService.get(`/test/eligible-donors/${bloodType}`);
    } catch (error) {
      console.error('Error fetching eligible donors:', error);
      throw error;
    }
  }
}

export default new AlertService();


