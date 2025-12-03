import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't retry refresh for auth endpoints to avoid infinite loop
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // If refresh successful, retry the original request
        if (refreshResponse.status === 200) {
          return API(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear any stored auth state and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        // Clear Redux state if available
        if (window.store) {
          window.store.dispatch({ type: 'auth/logout' });
        }
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Methods
export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  refreshToken: () => API.post('/auth/refresh')
};

export const moduleService = {
  getAll: () => API.get('/modules'),
  getById: (id) => API.get(`/modules/${id}`),
  create: (moduleData) => API.post('/modules', moduleData),
  update: (id, moduleData) => API.put(`/modules/${id}`, moduleData),
  delete: (id) => API.delete(`/modules/${id}`)
};

export const lessonService = {
  getAll: () => API.get('/lessons'),
  getByModule: (moduleId) => API.get(`/lessons/module/${moduleId}`),
  getById: (id) => API.get(`/lessons/${id}`),
  create: (lessonData) => {
    const formData = new FormData();
    Object.keys(lessonData).forEach(key => {
      if (key === 'pdf' && lessonData[key]) {
        formData.append('pdf', lessonData[key]);
      } else {
        formData.append(key, lessonData[key]);
      }
    });
    return API.post('/lessons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, lessonData) => {
    const formData = new FormData();
    Object.keys(lessonData).forEach(key => {
      if (key === 'pdf' && lessonData[key]) {
        formData.append('pdf', lessonData[key]);
      } else {
        formData.append(key, lessonData[key]);
      }
    });
    return API.put(`/lessons/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => API.delete(`/lessons/${id}`)
};

export const quizService = {
  getByModule: (moduleId) => API.get(`/quiz/module/${moduleId}`),
  getById: (id) => API.get(`/quiz/${id}`),
  create: (quizData) => API.post('/quiz', quizData),
  update: (id, quizData) => API.put(`/quiz/${id}`, quizData),
  delete: (id) => API.delete(`/quiz/${id}`),
  submit: (id, answers) => API.post(`/quiz/${id}/submit`, { answers })
};

export const prospectService = {
  getAll: () => API.get('/prospects'),
  create: (formData) => API.post('/prospects', formData),
  updateStatus: (id, status) => API.put(`/prospects/${id}`, { status }),
  delete: (id) => API.delete(`/prospects/${id}`)
};

export const progressService = {
  getMy: () => API.get('/progress/me'),
  getStudent: (userId) => API.get(`/progress/student/${userId}`),
  markComplete: (lessonId) => API.post(`/progress/lesson/${lessonId}/complete`),
  saveQuizScore: (data) => API.post('/progress/quiz', data)
};

export const userService = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  update: (id, userData) => API.put(`/users/${id}`, userData),
  delete: (id) => API.delete(`/users/${id}`)
};

export const adminService = {
  seedProfessional: () => API.post('/admin/seed-professional')
};

export default API;
