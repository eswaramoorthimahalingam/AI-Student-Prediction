import apiClient from './apiClient';

const authService = {
  login: async ({ identifier, password }) => {
    const response = await apiClient.post('/auth/login', {
      email: identifier,
      identifier,
      password,
    });

    return response.data;
  },

  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
