import axios from 'axios';

const getBaseApiUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return '/api';
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const rawApiUrl = getBaseApiUrl();
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const normalizedBaseURL = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

export const api = axios.create({
  baseURL: normalizedBaseURL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('rjt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // Only clear invalid token on explicit auth verification failures
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/me')) {
      const token = localStorage.getItem('rjt_token');
      if (token && !token.startsWith('rjt_session_')) {
        localStorage.removeItem('rjt_token');
      }
    }
    return Promise.reject(error);
  }
);

export const msg = error => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'A network or server error occurred. Please try again.';
};

export const img = url => {
  if (!url) return '';
  if (Array.isArray(url)) {
    url = url[0] || '';
  }
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('data:') || 
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/') || trimmed.startsWith('/favicon') || trimmed.startsWith('/icons/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  
  let apiOrigin = import.meta.env.VITE_API_ORIGIN;
  if (!apiOrigin || apiOrigin.includes('localhost')) {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        apiOrigin = 'https://ranjit-tour-travels-api.onrender.com';
      }
    }
  }
  if (!apiOrigin) {
    apiOrigin = cleanApiUrl.replace(/\/api\/?$/, '') || 'https://ranjit-tour-travels-api.onrender.com';
  }
  return `${apiOrigin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};
