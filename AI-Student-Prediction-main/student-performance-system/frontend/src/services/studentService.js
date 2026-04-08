import apiClient from './apiClient';

const studentService = {
  listStudents: async (params = {}) => {
    const response = await apiClient.get('/students', { params });
    return response.data.students;
  },

  getStudent: async (studentId) => {
    const response = await apiClient.get(`/students/${studentId}`);
    return response.data.student;
  },

  createStudent: async (payload) => {
    const response = await apiClient.post('/students', payload);
    return response.data.student;
  },

  updateStudent: async (studentId, payload) => {
    const response = await apiClient.put(`/students/${studentId}`, payload);
    return response.data.student;
  },

  deleteStudent: async (studentId) => {
    const response = await apiClient.delete(`/students/${studentId}`);
    return response.data;
  },
};

export default studentService;
