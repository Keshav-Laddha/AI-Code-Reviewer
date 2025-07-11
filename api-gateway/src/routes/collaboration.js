const express = require('express');
const collaborationService = require('../services/collaborationService');

const router = express.Router();

router.post('/sessions', async (req, res) => {
  try {
    const result = await collaborationService.createSession(req.body, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const result = await collaborationService.getSessions(req.user, req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const result = await collaborationService.getSession(req.params.sessionId, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

router.put('/sessions/:sessionId', async (req, res) => {
  try {
    const result = await collaborationService.updateSession(req.params.sessionId, req.body, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const result = await collaborationService.deleteSession(req.params.sessionId, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

router.post('/sessions/:sessionId/join', async (req, res) => {
  try {
    const result = await collaborationService.joinSession(req.params.sessionId, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join session' });
  }
});

router.post('/sessions/:sessionId/leave', async (req, res) => {
  try {
    const result = await collaborationService.leaveSession(req.params.sessionId, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave session' });
  }
});

router.post('/sessions/:sessionId/invite', async (req, res) => {
  try {
    const result = await collaborationService.inviteUser(req.params.sessionId, req.body.email, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

module.exports = router;
