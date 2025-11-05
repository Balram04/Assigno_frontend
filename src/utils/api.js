import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Course APIs
export const courseAPI = {
  getAllCourses: () => api.get('/courses'),
  getCourseById: (courseId) => api.get(`/courses/${courseId}`),
  getStudentCourses: (studentId) => api.get(`/courses/student/${studentId}`),
  getProfessorCourses: (professorId) => api.get(`/courses/professor/${professorId}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (courseId, updates) => api.put(`/courses/${courseId}`, updates),
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),
  enrollStudent: (courseId, studentId) => api.post(`/courses/${courseId}/enroll`, { studentId }),
  unenrollStudent: (courseId, studentId) => api.post(`/courses/${courseId}/unenroll`, { studentId }),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),
  getCourseAssignments: (courseId) => api.get(`/courses/${courseId}/assignments`),
  getCourseAnalytics: (courseId) => api.get(`/courses/${courseId}/analytics`),
};

// Assignment APIs
export const assignmentAPI = {
  getAllAssignments: () => api.get('/assignments'),
  getStudentAssignments: () => api.get('/assignments/student'),
  getAssignmentDetails: (assignmentId) => api.get(`/assignments/${assignmentId}`),
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  updateAssignment: (assignmentId, updates) => api.put(`/assignments/${assignmentId}`, updates),
  deleteAssignment: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
};

// Submission APIs
export const submissionAPI = {
  submitAssignment: (formData) => api.post('/submissions/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSubmissionStatus: (assignmentId, groupId) => api.get(`/submissions/status/${assignmentId}/${groupId}`),
  getGroupProgress: (groupId) => api.get(`/submissions/progress/${groupId}`),
  gradeSubmission: (submissionId, gradeData) => api.post(`/submissions/grade/${submissionId}`, gradeData),
  acknowledgeSubmission: (submissionId, note) => api.post(`/submissions/acknowledge/${submissionId}`, { acknowledgmentNote: note }),
  updateProgress: (submissionId, progressPercentage) => api.patch(`/submissions/progress/${submissionId}`, { progressPercentage }),
  downloadFile: (submissionId, fileIndex) => api.get(`/submissions/download/${submissionId}/${fileIndex}`, { responseType: 'blob' }),
};

// Group APIs
export const groupAPI = {
  getAllGroups: () => api.get('/groups'),
  getUserGroups: () => api.get('/groups/my-groups'),
  getGroupDetails: (groupId) => api.get(`/groups/${groupId}`),
  createGroup: (groupData) => api.post('/groups', groupData),
  updateGroup: (groupId, updates) => api.put(`/groups/${groupId}`, updates),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.post(`/groups/${groupId}/leave`),
};

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

