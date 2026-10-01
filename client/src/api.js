import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
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
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/images/') || url.startsWith('images/') || url.startsWith('/favicon') || url.startsWith('/icons/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
  return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};
