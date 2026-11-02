import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization headers from localStorage if stored (as fallback to cookies)
api.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('dmms_user_token');
    const schoolToken = localStorage.getItem('dmms_school_token');
    
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    } else if (schoolToken) {
      config.headers.Authorization = `Bearer ${schoolToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
