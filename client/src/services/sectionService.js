import api from './api';

const sectionService = {
  async getSections(params = {}) {
    const res = await api.get('/sections', { params });
    return res.data;
  },

  async getSectionById(id) {
    const res = await api.get(`/sections/${id}`);
    return res.data;
  },

  async createSection(data) {
    const res = await api.post('/sections', data);
    return res.data;
  },

  async updateSection(id, data) {
    const res = await api.put(`/sections/${id}`, data);
    return res.data;
  },

  async updateSectionStatus(id, isActive) {
    const res = await api.patch(`/sections/${id}/status`, { isActive });
    return res.data;
  }
};

export default sectionService;
