import api from './api';

const subjectService = {
  async getSubjects(params = {}) {
    const res = await api.get('/subjects', { params });
    return res.data;
  },

  async getSubjectById(id) {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  },

  async createSubject(data) {
    const res = await api.post('/subjects', data);
    return res.data;
  },

  async updateSubject(id, data) {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  },

  async updateSubjectStatus(id, isActive) {
    const res = await api.patch(`/subjects/${id}/status`, { isActive });
    return res.data;
  }
};

export default subjectService;
