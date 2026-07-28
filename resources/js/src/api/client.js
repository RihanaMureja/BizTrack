/**
 * Axios HTTP client with auth interceptors.
 * Install axios first: npm install axios
 *
 * All API modules import this client instead of raw fetch.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
client.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('biztrack_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
      } catch { /* ignore */ }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('biztrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
