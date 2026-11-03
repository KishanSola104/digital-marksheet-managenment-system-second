import api from './api';

const academicYearService = {
  async getAcademicYears() {
    const res = await api.get('/academic-years');
    return res.data;
  }
};

export default academicYearService;
