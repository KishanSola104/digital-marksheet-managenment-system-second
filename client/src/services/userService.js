import api from './api';

const userService = {
  async getUsers(params = {}) {
    const res = await api.get('/users', { params });
    return res.data;
  },

  async getUserById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async createUser(data) {
    const res = await api.post('/users', data);
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  async updateUserStatus(id, isActive) {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },

  async getRoles() {
    const res = await api.get('/roles');
    return res.data;
  }
};

export default userService;
