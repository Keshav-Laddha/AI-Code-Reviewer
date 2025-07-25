const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

client.connect();

module.exports = client;