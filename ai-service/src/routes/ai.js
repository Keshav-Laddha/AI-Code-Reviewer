// ai-service/src/routes/ai.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/ai/review
 * Single code review endpoint.
 * Expects: { code: string, language: string, fileName?: string }
 */
router.post('/review', async (req, res) => {
  const { code, language, fileName } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  // TODO: Replace this dummy logic with real AI review integration
  const result = {
    summary: `AI review for ${fileName || 'your code'} (${language}):\nNo major issues found.`,
    suggestions: [
      { line: 1, comment: 'Consider adding comments to improve code readability.' }
    ]
  };

  res.json(result);
});

/**
 * POST /api/ai/review/batch
 * Batch code review endpoint.
 * Expects: { files: [{ code: string, language: string, fileName: string }] }
 */
router.post('/review/batch', async (req, res) => {
  const { files } = req.body;

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'Files array is required.' });
  }

  // Dummy batch review
  const results = files.map(file => ({
    fileName: file.fileName,
    summary: `AI review for ${file.fileName} (${file.language}):\nNo major issues found.`,
    suggestions: [
      { line: 1, comment: 'Consider adding comments to improve code readability.' }
    ]
  }));

  res.json({ results });
});

/**
 * POST /api/ai/explain
 * Code explanation endpoint.
 * Expects: { code: string, language: string }
 */
router.post('/explain', async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required.' });
  }

  // Dummy explanation
  const explanation = `This is a dummy explanation for your ${language} code. Replace this with real AI output.`;

  res.json({ explanation });
});

module.exports = router;