const redis = require('redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    this.client.on('error', (err) => {
      logger.error('Redis Cache error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Cache service connected to Redis');
    });

    this.client.connect();
  }

  async get(key) {
    try {
      const result = await this.client.get(key);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async flushAll() {
    try {
      await this.client.flushAll();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  // Cache with pattern-based invalidation
  async setWithPattern(key, value, pattern, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      await this.client.sAdd(`pattern:${pattern}`, key);
      return true;
    } catch (error) {
      logger.error('Cache set with pattern error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await this.client.sMembers(`pattern:${pattern}`);
      if (keys.length > 0) {
        await this.client.del(...keys);
        await this.client.del(`pattern:${pattern}`);
      }
      return true;
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();