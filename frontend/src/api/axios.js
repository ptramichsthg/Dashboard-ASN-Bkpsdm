import axios from 'axios';
import apiCache from '../utils/apiCache';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach bearer token and handle caching
api.interceptors.request.use(
  (config) => {
    // Generate cache key based on URL and params
    if (config.method === 'get') {
      const cacheKey = config.url + (config.params ? JSON.stringify(config.params) : '');
      
      // If cached data exists, short-circuit the request using a custom adapter
      if (apiCache.has(cacheKey)) {
        config.adapter = () => {
          return Promise.resolve({
            data: apiCache.get(cacheKey),
            status: 200,
            statusText: 'OK (Cached)',
            headers: {},
            config,
            request: {}
          });
        };
      }
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle caching and token expiry
api.interceptors.response.use(
  (response) => {
    // Save successful GET requests to cache
    if (response.config.method === 'get') {
      const cacheKey = response.config.url + (response.config.params ? JSON.stringify(response.config.params) : '');
      apiCache.set(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid / expired: clean session and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      apiCache.clear();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
