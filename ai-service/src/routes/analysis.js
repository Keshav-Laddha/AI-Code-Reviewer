const express = require('express');
const { body, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const staticAnalysis = require('../services/staticAnalysis');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

const router = express.Router();

// Code complexity analysis
router.post('/complexity', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    
    const cacheKey = `complexity:${Buffer.from(code).toString('base64').substring(0, 32)}`;
    const cachedResult = await cacheService.get(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const analysis = await staticAnalysis.analyzeComplexity(code, language);
    
    await cacheService.set(cacheKey, analysis, 1800); // 30 minutes
    res.json(analysis);

  } catch (error) {
    logger.error('Complexity analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze complexity' });
  }
});

// Security vulnerability analysis
router.post('/security', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    
    const securityAnalysis = await staticAnalysis.analyzeSecurity(code, language);
    const aiSecurityReview = await aiService.analyzeSecurityVulnerabilities(code, language);
    
    const result = {
      timestamp: new Date().toISOString(),
      staticAnalysis: securityAnalysis,
      aiAnalysis: aiSecurityReview,
      riskLevel: calculateRiskLevel(securityAnalysis, aiSecurityReview)
    };

    res.json(result);

  } catch (error) {
    logger.error('Security analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze security' });
  }
});

// Performance analysis
router.post('/performance', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    
    const performanceAnalysis = await aiService.analyzePerformance(code, language);
    
    res.json({
      timestamp: new Date().toISOString(),
      language,
      analysis: performanceAnalysis
    });

  } catch (error) {
    logger.error('Performance analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

// Code explanation
router.post('/explain', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    
    const explanation = await aiService.explainCode(code, language);
    
    res.json({
      timestamp: new Date().toISOString(),
      explanation
    });

  } catch (error) {
    logger.error('Code explanation error:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// Code suggestions
router.post('/suggestions', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required'),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language, context } = req.body;
    
    const suggestions = await aiService.generateSuggestions(code, language, context);
    
    res.json({
      timestamp: new Date().toISOString(),
      suggestions
    });

  } catch (error) {
    logger.error('Code suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

function calculateRiskLevel(staticAnalysis, aiAnalysis) {
  const highRiskPatterns = staticAnalysis.vulnerabilities?.filter(v => v.severity === 'high')?.length || 0;
  const aiHighRisk = aiAnalysis.risks?.filter(r => r.level === 'high')?.length || 0;
  
  const totalHighRisk = highRiskPatterns + aiHighRisk;
  
  if (totalHighRisk > 3) return 'critical';
  if (totalHighRisk > 1) return 'high';
  if (totalHighRisk > 0) return 'medium';
  return 'low';
}

module.exports = router;