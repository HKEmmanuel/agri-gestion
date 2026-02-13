import axios from 'axios';

// Remove trailing slash if present and ensure protocol
let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
if (!apiUrl.startsWith('http')) {
  apiUrl = `https://${apiUrl}`;
}
const BASE_URL = apiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
