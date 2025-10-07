import ApiService from './ApiService';

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      return await ApiService.get('/dashboard/stats');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get blood inventory
  async getBloodInventory() {
    try {
      return await ApiService.get('/dashboard/blood-inventory');
    } catch (error) {
      console.error('Error fetching blood inventory:', error);
      throw error;
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      return await ApiService.get(`/dashboard/recent-activity?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Get latest news
  async getLatestNews() {
    try {
      return await ApiService.get('/dashboard/latest-news');
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw error;
    }
  }
}

export default new DashboardService();
