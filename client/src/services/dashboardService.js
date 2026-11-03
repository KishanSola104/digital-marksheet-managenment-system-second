import api from './api';

const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary');
    return res.data;
  }
};

export default dashboardService;
