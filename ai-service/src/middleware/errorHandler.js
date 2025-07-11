const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error('AI Service Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    ip: req.ip
  });

  let statusCode = 500;
  let message = 'Internal Server Error';

  // OpenAI API errors
  if (error.response?.status) {
    statusCode = error.response.status;
    message = error.response.data?.error?.message || 'AI service error';
  }

  // Rate limiting errors
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    statusCode = 429;
    message = 'Rate limit exceeded. Please try again later.';
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    statusCode = 408;
    message = 'Request timeout';
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'AI processing failed';
  }

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.response?.data 
    })
  });
};

module.exports = errorHandler;