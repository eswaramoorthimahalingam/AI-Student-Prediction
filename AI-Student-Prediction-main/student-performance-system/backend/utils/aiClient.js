const axios = require('axios');
const { PREDICTION_FIELDS } = require('./scoring');

const DEFAULT_AI_SERVICE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://ai-student-prediction-model.onrender.com'
    : 'http://localhost:8000';

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const getAiServiceUrls = () =>
  [...new Set([normalizeBaseUrl(process.env.AI_SERVICE_URL), DEFAULT_AI_SERVICE_URL].filter(Boolean))];

const isRetryableStatus = (statusCode) => [404, 408, 429, 500, 502, 503, 504].includes(statusCode);

const formatAiError = (error, baseUrl) => {
  if (error.response?.data?.error) {
    return `Prediction service at ${baseUrl} responded with: ${error.response.data.error}`;
  }

  if (error.response?.status) {
    return `Prediction service at ${baseUrl} failed with status ${error.response.status}.`;
  }

  if (error.code === 'ECONNABORTED') {
    return `Prediction service at ${baseUrl} timed out.`;
  }

  return `Prediction service at ${baseUrl} is unavailable.`;
};

const predictWithModel = async (payload) => {
  const requestBody = PREDICTION_FIELDS.reduce((accumulator, field) => {
    accumulator[field] = payload[field];
    return accumulator;
  }, {});

  let lastError = null;

  for (const baseUrl of getAiServiceUrls()) {
    try {
      const response = await axios.post(`${baseUrl}/predict`, requestBody, {
        timeout: 15000,
      });

      return {
        predictedScore: Number(response.data.predictedScore),
        pass: Boolean(response.data.pass),
      };
    } catch (error) {
      lastError = new Error(formatAiError(error, baseUrl));

      if (!error.response || isRetryableStatus(error.response.status)) {
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('Prediction service is unavailable.');
};

module.exports = { predictWithModel };
