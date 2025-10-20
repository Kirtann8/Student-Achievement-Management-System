import axios from 'axios';

// Achievement service functions
export const achievementService = {
  // Student functions
  async createAchievement(formData) {
    const response = await axios.post('/api/achievements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyAchievements() {
    const response = await axios.get('/api/achievements/me');
    return response.data;
  },

  async updateAchievement(id, formData) {
    const response = await axios.put(`/api/achievements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAchievement(id) {
    const response = await axios.delete(`/api/achievements/${id}`);
    return response.data;
  },

  // Admin functions
  async getAllAchievements(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    
    const response = await axios.get(`/api/achievements?${params.toString()}`);
    return response.data;
  },

  async reviewAchievement(id, action, comment = '') {
    const response = await axios.post(`/api/achievements/${id}/review`, {
      action,
      comment
    });
    return response.data;
  },

  async getAnalytics() {
    const response = await axios.get('/api/achievements/stats/analytics');
    return response.data;
  }
};