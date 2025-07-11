const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

class AIService {
  async reviewCode(code, language, fileName) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/review`, {
        code,
        language,
        fileName
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      throw error;
    }
  }

  async explainCode(code, language) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/explain`, {
        code,
        language
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      throw error;
    }
  }
}

module.exports = new AIService();
