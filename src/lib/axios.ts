import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // dynamic API URL with fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Basic error processing structure
    console.error('API Error:', error.response?.data || error.message);
    // You could also trigger a global toast notification here if needed
    return Promise.reject(error);
  }
);
