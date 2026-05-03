import axios from 'axios';

// Ensure NEXT_PUBLIC_API_URL is used if available, otherwise fallback to local/production defaults
const getBaseURL = () => {
  // Always use local backend for local development
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  
  // FORCEfully hardcode Render backend for production to bypass ALL Vercel routing/env issues
  return 'https://saas-project-1-59yi.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pulse_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pulse_token');
        localStorage.removeItem('pulse-auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;