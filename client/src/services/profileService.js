import api from './api';

const profileService = {
  async getProfile() {
    const res = await api.get('/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/profile', data);
    return res.data;
  }
};

export default profileService;
