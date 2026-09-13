import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const documentAPI = {
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async (limit = 50, offset = 0) => {
    const response = await api.get('/documents', {
      params: { limit, offset },
    });
    return response.data;
  },

  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  searchDocuments: async (query) => {
    const response = await api.get('/documents/search', {
      params: { q: query },
    });
    return response.data;
  },

  getDocumentStatus: async (id) => {
    const response = await api.get(`/documents/${id}/status`);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
