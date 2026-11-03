import api from './api';

const authService = {
  // ----------------------------------------
  // School Endpoints
  // ----------------------------------------
  async registerSchool(data) {
    const res = await api.post('/auth/register-school', data);
    return res.data;
  },

  async loginSchool(schoolId, password) {
    const res = await api.post('/auth/school-login', { schoolId, password });
    return res.data;
  },

  async logoutSchool() {
    const res = await api.post('/auth/school-logout');
    return res.data;
  },

  async getSchoolSession() {
    const res = await api.get('/auth/school-session');
    return res.data;
  },

  async forgotSchoolPassword(email) {
    const res = await api.post('/auth/school-forgot-password', { email });
    return res.data;
  },

  async resetSchoolPassword(token, newPassword) {
    const res = await api.post('/auth/school-reset-password', { token, newPassword });
    return res.data;
  },

  async changeSchoolPassword(currentPassword, newPassword) {
    const res = await api.post('/auth/school-change-password', { currentPassword, newPassword });
    return res.data;
  },

  // ----------------------------------------
  // User Endpoints
  // ----------------------------------------
  async loginUser({ userId, password, role, schoolId }) {
    const res = await api.post('/auth/user-login', { userId, password, role, schoolId });
    return res.data;
  },

  async logoutUser() {
    const res = await api.post('/auth/user-logout');
    return res.data;
  },

  async getUserSession() {
    const res = await api.get('/auth/user-session');
    return res.data;
  },

  async forgotUserPassword(schoolId, identifier) {
    const res = await api.post('/auth/user-forgot-password', { schoolId, identifier });
    return res.data;
  },

  async resetUserPassword(token, newPassword) {
    const res = await api.post('/auth/user-reset-password', { token, newPassword });
    return res.data;
  },

  async changeUserPassword(currentPassword, newPassword) {
    const res = await api.post('/auth/user-change-password', { currentPassword, newPassword });
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  }
};

export default authService;
