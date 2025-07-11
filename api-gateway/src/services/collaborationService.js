const axios = require('axios');
const jwt = require('jsonwebtoken');

const COLLABORATION_SERVICE_URL = process.env.COLLABORATION_SERVICE_URL || 'http://localhost:3003';

class CollaborationService {
  // Generate JWT token for user
  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  async createSession(sessionData, user) {
    try {
      const token = this.generateToken(user);
      
      const response = await axios.post(`${COLLABORATION_SERVICE_URL}/sessions`, sessionData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async getSessions(user, query) {
    try {
      const token = this.generateToken(user);
      const params = new URLSearchParams(query);
      const response = await axios.get(`${COLLABORATION_SERVICE_URL}/sessions?${params}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async getSession(sessionId, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.get(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async updateSession(sessionId, sessionData, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.put(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}`, sessionData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async deleteSession(sessionId, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.delete(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async joinSession(sessionId, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.post(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}/join`, {}, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async leaveSession(sessionId, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.post(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}/leave`, {}, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }

  async inviteUser(sessionId, email, user) {
    try {
      const token = this.generateToken(user);
      const response = await axios.post(`${COLLABORATION_SERVICE_URL}/sessions/${sessionId}/invite`, 
        { email }, 
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Collaboration Service error:', error.message);
      throw error;
    }
  }
}

module.exports = new CollaborationService();
