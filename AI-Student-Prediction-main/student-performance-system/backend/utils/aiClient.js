const axios = require('axios');
const { PREDICTION_FIELDS } = require('./scoring');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const predictWithModel = async (payload) => {
  const requestBody = PREDICTION_FIELDS.reduce((accumulator, field) => {
    accumulator[field] = payload[field];
    return accumulator;
  }, {});

  const response = await axios.post(`${AI_SERVICE_URL}/predict`, requestBody, {
    timeout: 10000,
  });

  return {
    predictedScore: Number(response.data.predictedScore),
    pass: Boolean(response.data.pass),
  };
};

module.exports = { predictWithModel };
