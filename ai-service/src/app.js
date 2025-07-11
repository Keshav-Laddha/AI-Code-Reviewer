const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const reviewRoutes = require('./routes/review');
const analysisRoutes = require('./routes/analysis');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'AI Code Review' });
});

// Routes
app.use('/review', reviewRoutes);
app.use('/analysis', analysisRoutes);

// Explain route
app.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const aiService = require('./services/aiService');
    const explanation = await aiService.explainCode(code, language);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`AI Service running on port ${PORT}`);
});

module.exports = app;