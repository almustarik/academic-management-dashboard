import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3001', // json-server mock API url
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
