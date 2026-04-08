import apiClient from './apiClient';

const predictionService = {
  predict: async (payload) => {
    const response = await apiClient.post('/predict', payload);
    return response.data;
  },

  predictStudent: async (studentId) => {
    const response = await apiClient.post('/predict', { studentId });
    return response.data;
  },

  getHistory: async () => {
    const response = await apiClient.get('/predictions/history');
    return response.data.predictions;
  },

  getLeaderboard: async () => {
    const response = await apiClient.get('/leaderboard');
    return response.data.records;
  },
};

export default predictionService;
