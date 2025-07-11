const express = require('express');
const { body, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const staticAnalysis = require('../services/staticAnalysis');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

const router = express.Router();

// Code review endpoint
router.post('/', [
  body('code').notEmpty().withMessage('Code is required'),
  body('language').notEmpty().withMessage('Language is required'),
  body('fileName').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language, fileName, userId } = req.body;

    // Generate cache key
    const cacheKey = `review:${Buffer.from(code).toString('base64').substring(0, 32)}`;
    
    // Check cache first
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      logger.info('Returning cached review result');
      // Return ONLY the aiReview part if cachedResult is a wrapper object
      if (cachedResult.aiReview) {
        return res.json(cachedResult.aiReview);
      }
      // If cache is already just the review object:
      return res.json(cachedResult);
    }

    // Run static analysis (optional, not sent to frontend)
    await staticAnalysis.analyze(code, language);

    // Run AI review
    const aiReviewResult = await aiService.reviewCode(code, language, fileName);

    // Cache the review object for 1 hour
    await cacheService.set(cacheKey, aiReviewResult, 3600);

    logger.info(`Code review completed for ${language} file`);
    // Respond with ONLY the review object
    res.json(aiReviewResult);

  } catch (error) {
    logger.error('Review error:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

// Batch review endpoint
router.post('/batch', [
  body('files').isArray().withMessage('Files must be an array'),
  body('files.*.code').notEmpty().withMessage('Each file must have code'),
  body('files.*.language').notEmpty().withMessage('Each file must have language'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { files, userId } = req.body;

    // Process files in parallel with limit
    const results = await Promise.all(
      files.slice(0, 10).map(async (file) => {
        try {
          const staticAnalysisResult = await staticAnalysis.analyze(file.code, file.language);
          const aiReviewResult = await aiService.reviewCode(file.code, file.language, file.fileName);
          
          return {
            fileName: file.fileName,
            language: file.language,
            staticAnalysis: staticAnalysisResult,
            aiReview: aiReviewResult,
            summary: {
              totalIssues: staticAnalysisResult.issues.length + aiReviewResult.issues.length,
              severity: calculateOverallSeverity(staticAnalysisResult, aiReviewResult)
            }
          };
        } catch (error) {
          logger.error(`Error processing file ${file.fileName}:`, error);
          return {
            fileName: file.fileName,
            error: 'Failed to process file'
          };
        }
      })
    );

    res.json({ results });

  } catch (error) {
    logger.error('Batch review error:', error);
    res.status(500).json({ error: 'Failed to review files' });
  }
});

function calculateOverallSeverity(staticAnalysis, aiReview) {
  const allIssues = [...staticAnalysis.issues, ...aiReview.issues];
  if (allIssues.some(issue => issue.severity === 'error')) return 'error';
  if (allIssues.some(issue => issue.severity === 'warning')) return 'warning';
  return 'info';
}

module.exports = router;