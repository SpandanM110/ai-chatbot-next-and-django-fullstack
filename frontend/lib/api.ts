import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const chatApi = {
  sendMessage: async (message: string, sessionId?: string, stream = false) => {
    if (stream) {
      // Handle streaming response
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          stream: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response; // Return the response object for streaming
    } else {
      // Handle non-streaming response
      const response = await api.post('/chat/', {
        message,
        session_id: sessionId,
        stream: false,
      });
      return response.data;
    }
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(`/chat/session/${sessionId}/`);
    return response.data;
  },

  getSessions: async () => {
    const response = await api.get('/chat/sessions/');
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await api.delete(`/chat/session/${sessionId}/delete/`);
    return response.data;
  },
};

// File API
export const fileApi = {
  uploadFile: async (file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post('/file/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFiles: async () => {
    const response = await api.get('/file/');
    return response.data;
  },

  getFile: async (fileId: number) => {
    const response = await api.get(`/file/${fileId}/`);
    return response.data;
  },

  deleteFile: async (fileId: number) => {
    const response = await api.delete(`/file/${fileId}/delete/`);
    return response.data;
  },

  searchFiles: async (query: string) => {
    const response = await api.post('/file/search/', { query });
    return response.data;
  },
};

export default api;
