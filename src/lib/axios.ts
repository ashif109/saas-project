import axios from 'axios';

// Ensure NEXT_PUBLIC_API_URL is used if available, otherwise fallback to local/production defaults
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window === 'undefined') {
    // Server-side rendering (needs absolute URL)
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000'
      : 'https://saas-project-1-59yi.onrender.com';
  }
  
  // Client-side: rely on Next.js rewrites (from next.config.ts)
  return '';
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