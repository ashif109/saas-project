import axios from 'axios';

// Ensure NEXT_PUBLIC_API_URL is used if available, otherwise fallback to local/production defaults
const getBaseURL = () => {
  // If explicitly set to a valid external URL, use it
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For local development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Hardcoded production backend
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