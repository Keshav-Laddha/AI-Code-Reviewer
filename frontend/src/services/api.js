import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// AI service
export const aiService = {
  reviewCode: (code, language, fileName) => 
    api.post('/api/ai/review', { code, language, fileName }),
  batchReview: (files) => 
    api.post('/api/ai/review/batch', { files }),
  explainCode: (code, language) => 
    api.post('/api/ai/explain', { code, language }),
};

// Collaboration service
export const collaborationService = {
  createSession: (sessionData) => 
    api.post('/api/collaboration/sessions', sessionData),
  getSessions: () => 
    api.get('/api/collaboration/sessions'),
  getSession: (sessionId) => 
    api.get(`/api/collaboration/sessions/${sessionId}`),
  updateSession: (sessionId, data) => 
    api.put(`/api/collaboration/sessions/${sessionId}`, data),
  deleteSession: (sessionId) => 
    api.delete(`/api/collaboration/sessions/${sessionId}`),
  joinSession: (sessionId) => 
    api.post(`/api/collaboration/sessions/${sessionId}/join`),
  leaveSession: (sessionId) => 
    api.post(`/api/collaboration/sessions/${sessionId}/leave`),
  inviteUser: (sessionId, email) => 
    api.post(`/api/collaboration/sessions/${sessionId}/invite`, { email }),
};

// User service
export const userService = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getUsers: () => api.get('/api/users'),
};

export default api;