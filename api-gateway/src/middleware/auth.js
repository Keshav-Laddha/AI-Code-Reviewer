const jwt = require('jsonwebtoken');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;
    
    // Check Redis for user session
    const userSession = await redis.get(`user:${userId}`);
    if (!userSession) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = JSON.parse(userSession);
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;