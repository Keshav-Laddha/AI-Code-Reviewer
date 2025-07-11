const redis = require('redis');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Collaboration Service connected to Redis');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('end', () => {
      logger.warn('Redis client disconnected');
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
    }
  }

  async get(key) {
    try {
      const result = await this.client.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DELETE error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Session-specific methods
  async setSessionData(sessionId, data, ttl = 3600) {
    return this.set(`session:${sessionId}`, data, ttl);
  }

  async getSessionData(sessionId) {
    return this.get(`session:${sessionId}`);
  }

  async deleteSessionData(sessionId) {
    return this.del(`session:${sessionId}`);
  }

  // User presence methods
  async setUserPresence(sessionId, userId, data, ttl = 300) {
    return this.set(`presence:${sessionId}:${userId}`, data, ttl);
  }

  async getUserPresence(sessionId, userId) {
    return this.get(`presence:${sessionId}:${userId}`);
  }

  async deleteUserPresence(sessionId, userId) {
    return this.del(`presence:${sessionId}:${userId}`);
  }

  // Session participants tracking
  async addSessionParticipant(sessionId, userId) {
    try {
      await this.client.sAdd(`participants:${sessionId}`, userId);
      return true;
    } catch (error) {
      logger.error('Redis SADD error:', error);
      return false;
    }
  }

  async removeSessionParticipant(sessionId, userId) {
    try {
      await this.client.sRem(`participants:${sessionId}`, userId);
      return true;
    } catch (error) {
      logger.error('Redis SREM error:', error);
      return false;
    }
  }

  async getSessionParticipants(sessionId) {
    try {
      return await this.client.sMembers(`participants:${sessionId}`);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  // Pub/Sub for real-time events
  async publish(channel, message) {
    try {
      await this.client.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  async subscribe(channel, callback) {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          logger.error('Message parsing error:', error);
        }
      });
      
      return subscriber;
    } catch (error) {
      logger.error('Redis SUBSCRIBE error:', error);
      return null;
    }
  }
}

module.exports = new RedisClient();