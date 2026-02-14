// API Service Layer for Outbound Impact Backend
// Connects to: https://outbound-impact-backend-eight.vercel.app

import axios from 'axios';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout (faster fallback to demo mode)
});

// Track if backend is available
let backendAvailable = null; // null = unknown, true = available, false = unavailable

// Quick health check function
export const checkBackendHealth = async () => {
  try {
    await api.get('/health', { timeout: 5000 });
    backendAvailable = true;
    return true;
  } catch {
    backendAvailable = false;
    return false;
  }
};

export const isBackendAvailable = () => backendAvailable;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect to login - let components fall back to demo mode
    // This allows the dashboard to work without authentication
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Mark backend as needing auth (but don't redirect)
      console.log('Auth required - using demo mode');
    }
    return Promise.reject(error);
  }
);

// ========================
// DASHBOARD APIs
// ========================

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// ========================
// ITEMS / QR CODES APIs
// ========================

export const itemsAPI = {
  // Get all items for the user
  getAll: async () => {
    const response = await api.get('/items');
    return response.data;
  },

  // Get single item by ID
  getById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  // Get public item by slug (no auth required)
  getPublic: async (slug) => {
    const response = await api.get(`/items/public/${slug}`);
    return response.data;
  },

  // Update item
  update: async (id, data) => {
    const response = await api.put(`/items/${id}`, data);
    return response.data;
  },

  // Delete item
  delete: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  // Upload thumbnail
  uploadThumbnail: async (id, file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await api.post(`/items/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete thumbnail
  deleteThumbnail: async (id) => {
    const response = await api.delete(`/items/${id}/thumbnail`);
    return response.data;
  },
};

// ========================
// UPLOAD APIs
// ========================

export const uploadAPI = {
  // Upload file with progress tracking
  uploadFile: async (file, metadata, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata fields
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, metadata[key]);
        }
      });
    }

    const response = await api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
        }
      },
    });
    return response.data;
  },

  // Create text post
  createTextPost: async (data) => {
    const response = await api.post('/upload/text', data);
    return response.data;
  },

  // Create embed post
  createEmbedPost: async (data) => {
    const response = await api.post('/upload/embed', data);
    return response.data;
  },
};

// ========================
// CAMPAIGNS APIs
// ========================

export const campaignsAPI = {
  // Get all campaigns
  getAll: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },

  // Get campaign by ID
  getById: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // Create campaign
  create: async (data) => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  // Update campaign
  update: async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  // Delete campaign
  delete: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
};

// ========================
// ANALYTICS APIs
// ========================

export const analyticsAPI = {
  // Get basic analytics
  getBasic: async (timeRange = '7d') => {
    const response = await api.get(`/analytics?range=${timeRange}`);
    return response.data;
  },

  // Get advanced analytics
  getAdvanced: async (params) => {
    const response = await api.get('/analytics/advanced', { params });
    return response.data;
  },
};

// ========================
// AI CHAT APIs
// ========================

export const chatAPI = {
  // Start new conversation
  startConversation: async () => {
    const response = await api.post('/chat/conversations');
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  },

  // Get messages
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (messageId, isHelpful) => {
    const response = await api.post(`/chat/messages/${messageId}/feedback`, {
      isHelpful,
    });
    return response.data;
  },
};

// ========================
// AUTH APIs
// ========================

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Register
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ========================
// SUBSCRIPTION APIs
// ========================

export const subscriptionAPI = {
  // Get current subscription
  getCurrent: async () => {
    const response = await api.get('/subscription');
    return response.data;
  },

  // Get available plans
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },

  // Upgrade plan
  upgrade: async (planId) => {
    const response = await api.post('/subscription/upgrade', { planId });
    return response.data;
  },
};

// ========================
// TEAM APIs
// ========================

export const teamAPI = {
  // Get team members
  getMembers: async () => {
    const response = await api.get('/team');
    return response.data;
  },

  // Invite member
  invite: async (email, role) => {
    const response = await api.post('/team/invite', { email, role });
    return response.data;
  },

  // Remove member
  remove: async (memberId) => {
    const response = await api.delete(`/team/${memberId}`);
    return response.data;
  },

  // Update member role
  updateRole: async (memberId, role) => {
    const response = await api.put(`/team/${memberId}/role`, { role });
    return response.data;
  },
};

// Export default api instance for custom requests
export default api;
