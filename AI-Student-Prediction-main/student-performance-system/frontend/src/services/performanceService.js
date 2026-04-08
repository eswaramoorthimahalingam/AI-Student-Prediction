import apiClient from './apiClient';

const performanceService = {
  getMyPerformances: async () => {
    const response = await apiClient.get('/api/my-performances');
    return response.data.performances;
  },

  importCsv: async (file) => {
    const formData = new FormData();
    formData.append('csv', file);

    const response = await apiClient.post('/api/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default performanceService;
