import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('login')) {
      localStorage.removeItem('rjt_token');
      window.location.href = '/admin/login';
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
  const apiOrigin = import.meta.env.VITE_API_ORIGIN || cleanApiUrl.replace(/\/api\/?$/, '') || 'http://localhost:5000';
  return `${apiOrigin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};
