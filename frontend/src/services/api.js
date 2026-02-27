import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: 'https://campus-placement-5mto-qzpima1hr-ashikas-projects-66984d04.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors, e.g., 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth'; // Redirect to auth
    }
    return Promise.reject(error);
  }
);
export const AI_SERVICE_URL = process.env.REACT_APP_AI_URL;

export default api;
