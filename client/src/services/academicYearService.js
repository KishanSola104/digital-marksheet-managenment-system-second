import api from './api';

const academicYearService = {
  async getAcademicYears(params = {}) {
    const res = await api.get('/academic-years', { params });
    return res.data;
  },

  async getAcademicYearById(id) {
    const res = await api.get(`/academic-years/${id}`);
    return res.data;
  },

  async createAcademicYear(data) {
    const res = await api.post('/academic-years', data);
    return res.data;
  },

  async updateAcademicYear(id, data) {
    const res = await api.put(`/academic-years/${id}`, data);
    return res.data;
  },

  async setCurrentAcademicYear(id) {
    const res = await api.patch(`/academic-years/${id}/set-current`);
    return res.data;
  }
};

export default academicYearService;
