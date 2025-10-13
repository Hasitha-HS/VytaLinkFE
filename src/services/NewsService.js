import ApiService from './ApiService';

class NewsService {
  // Get all news
  async getAllNews() {
    try {
      return await ApiService.get('/news');
    } catch (error) {
      console.error('Error fetching all news:', error);
      throw error;
    }
  }

  // Get paginated news
  async getNewsPaginated(page = 0, size = 10) {
    try {
      return await ApiService.get(`/news/paginated?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Error fetching paginated news:', error);
      throw error;
    }
  }

  // Get latest news (for home screen)
  async getLatestNews(limit = 5) {
    try {
      return await ApiService.get(`/news/latest?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw error;
    }
  }

  // Get news by ID
  async getNewsById(id) {
    try {
      return await ApiService.get(`/news/${id}`);
    } catch (error) {
      console.error('Error fetching news by ID:', error);
      throw error;
    }
  }

  // Search news
  async searchNews(query, page = 0, size = 10) {
    try {
      return await ApiService.get(`/news/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  // Create news (admin only)
  async createNews(newsData) {
    try {
      return await ApiService.post('/news', newsData);
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  // Update news (admin only)
  async updateNews(id, newsData) {
    try {
      return await ApiService.put(`/news/${id}`, newsData);
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  // Delete news (admin only)
  async deleteNews(id) {
    try {
      return await ApiService.delete(`/news/${id}`);
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  // Get news by creator
  async getNewsByCreator(createdBy) {
    try {
      return await ApiService.get(`/news/creator/${createdBy}`);
    } catch (error) {
      console.error('Error fetching news by creator:', error);
      throw error;
    }
  }

  // Get news statistics
  async getNewsStats() {
    try {
      return await ApiService.get('/news/stats');
    } catch (error) {
      console.error('Error fetching news stats:', error);
      throw error;
    }
  }
}

export default new NewsService();
