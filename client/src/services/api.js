import axios from 'axios';

// For Vercel, the API routes are handled by api/[...slug].js
// In production, use '/api' as baseURL for same-origin requests
// In development, use the full URL if VITE_API_URL is set, otherwise '/api'
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // On Vercel, api/[...slug].js handles /api/* routes
  // So we use '/api' as baseURL
  return '/api';
};

const baseURL = getBaseURL();

const API = axios.create({
  baseURL: baseURL,
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
          `${baseURL}/auth/refresh`,
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
  getAll: (params) => API.get('/quiz', { params }),
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
  delete: (id) => API.delete(`/users/${id}`),
  suspend: (id, data) => API.post(`/users/${id}/suspend`, data),
  activate: (id) => API.post(`/users/${id}/activate`)
};

export const adminService = {
  initializeDatabase: () => API.post('/admin/init-database')
};

export const groupService = {
  getAll: (params) => API.get('/groups', { params }),
  getMy: () => API.get('/groups/my'),
  getById: (id) => API.get(`/groups/${id}`),
  create: (data) => API.post('/groups', data),
  update: (id, data) => API.put(`/groups/${id}`, data),
  delete: (id) => API.delete(`/groups/${id}`),
  addStudents: (id, studentIds) => API.post(`/groups/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) => API.delete(`/groups/${id}/students/${studentId}`),
  assignModules: (id, moduleIds) => API.post(`/groups/${id}/modules`, { moduleIds })
};

export const notificationService = {
  getAll: (params) => API.get('/notifications', { params }),
  getUnread: () => API.get('/notifications/unread'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  create: (data) => API.post('/notifications', data),
  delete: (id) => API.delete(`/notifications/${id}`)
};

export const gradeService = {
  create: (data) => API.post('/grades', data),
  getStudentGrades: (studentId) => API.get(`/grades/student/${studentId}`),
  getModuleGrades: (moduleId) => API.get(`/grades/module/${moduleId}`),
  update: (id, data) => API.put(`/grades/${id}`, data),
  getAnalytics: (params) => API.get('/grades/analytics', { params })
};

export const discussionService = {
  getAll: () => API.get('/discussions'),
  getById: (id) => API.get(`/discussions/${id}`),
  create: (data) => API.post('/discussions', data),
  sendMessage: (id, content) => API.post(`/discussions/${id}/messages`, { content }),
  markAsRead: (id) => API.put(`/discussions/${id}/read`)
};

export const profileService = {
  getMy: () => API.get('/profile/me'),
  update: (data) => API.put('/profile/me', data),
  updatePreferences: (data) => API.put('/profile/preferences', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return API.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  changePassword: (data) => API.put('/profile/password', data)
};

export const moduleServiceExtended = {
  getAssigned: () => API.get('/modules/assigned'),
  getMyOrder: () => API.get('/modules/my-order'),
  reorder: (moduleOrder) => API.put('/modules/reorder', { moduleOrder })
};

export const quizServiceExtended = {
  getResults: (params) => API.get('/quiz/results', { params }),
  getStudentResults: (studentId) => API.get(`/quiz/results/student/${studentId}`),
  getAnalytics: (params) => API.get('/quiz/analytics', { params })
};

export const projectService = {
  getAll: (params) => API.get('/projects', { params }),
  getMy: () => API.get('/projects/my'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  submit: (id, formData) => API.post(`/projects/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  grade: (id, data) => API.post(`/projects/${id}/grade`, data)
};

export const approvalService = {
  request: (moduleId) => API.post(`/approvals/request/${moduleId}`),
  getPending: () => API.get('/approvals/pending'),
  getMy: () => API.get('/approvals/my'),
  approve: (id, comment) => API.post(`/approvals/${id}/approve`, { comment }),
  reject: (id, comment) => API.post(`/approvals/${id}/reject`, { comment })
};

export const categoryService = {
  getAll: (params) => API.get('/categories', { params }),
  getById: (id) => API.get(`/categories/${id}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`)
};

export const formationService = {
  getAll: (params) => API.get('/formations', { params }),
  getById: (id) => API.get(`/formations/${id}`),
  create: (data) => API.post('/formations', data),
  update: (id, data) => API.put(`/formations/${id}`, data),
  delete: (id) => API.delete(`/formations/${id}`)
};

export default API;
