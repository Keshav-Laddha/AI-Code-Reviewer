// collaboration-service/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Malformed token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check Redis for user session (consistent with API Gateway)
    const userSession = await redis.get(`user:${decoded.userId}`);
    if (!userSession) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = userSession;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
