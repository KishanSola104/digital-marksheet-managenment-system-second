import api from './api';

const classService = {
  async getClasses(params = {}) {
    const res = await api.get('/classes', { params });
    return res.data;
  },

  async getClassById(id) {
    const res = await api.get(`/classes/${id}`);
    return res.data;
  },

  async createClass(data) {
    const res = await api.post('/classes', data);
    return res.data;
  },

  async updateClass(id, data) {
    const res = await api.put(`/classes/${id}`, data);
    return res.data;
  },

  async updateClassStatus(id, isActive) {
    const res = await api.patch(`/classes/${id}/status`, { isActive });
    return res.data;
  }
};

export default classService;
