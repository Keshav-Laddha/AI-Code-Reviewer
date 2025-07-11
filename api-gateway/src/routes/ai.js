const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

router.post('/review', async (req, res) => {
  try {
    const { code, language, fileName } = req.body;
    const result = await aiService.reviewCode(code, language, fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI review failed' });
  }
});

router.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    const explanation = await aiService.explainCode(code, language);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ error: 'AI explanation failed' });
  }
});

module.exports = router;
