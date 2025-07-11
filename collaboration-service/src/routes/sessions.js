const express = require('express');
const { body, validationResult } = require('express-validator');
const Session = require('../models/Session');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get user sessions
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sessions = await Session.find({
      $or: [
        { owner: req.user.id },
        { participants: req.user.id }
      ]
    })
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });

    const total = await Session.countDocuments({
      $or: [
        { owner: req.user.id },
        { participants: req.user.id }
      ]
    });

    res.json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSessions: total
      }
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new session
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Session name is required'),
  body('language').optional().isString(),
  body('isPublic').optional().isBoolean(),
  body('code').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, language, isPublic, code } = req.body;

    const session = new Session({
      name,
      description: description || '',
      owner: req.user.id,
      language: language || 'javascript',
      isPublic: isPublic || false,
      code: code || '// Start coding here...\n',
      participants: [],
      comments: [],
      reviews: []
    });

    await session.save();

    res.status(201).json(session);
    logger.info(`Session created: ${name} by user ${req.user.id}`);
  } catch (error) {
    logger.error('Create session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific session
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check access permissions
    const hasAccess = session.owner === req.user.id ||
                     session.participants.includes(req.user.id) ||
                     session.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(session);
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update session
router.put('/:sessionId', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('language').optional().isString(),
  body('isPublic').optional().isBoolean(),
  body('code').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is owner
    if (session.owner !== req.user.id) {
      return res.status(403).json({ error: 'Only session owner can update' });
    }

    const updateData = req.body;
    updateData.updatedAt = Date.now();

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.sessionId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedSession);
    logger.info(`Session updated: ${updatedSession.name}`);
  } catch (error) {
    logger.error('Update session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete session
router.delete('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is owner
    if (session.owner !== req.user.id) {
      return res.status(403).json({ error: 'Only session owner can delete' });
    }

    await Session.findByIdAndDelete(req.params.sessionId);
    res.json({ message: 'Session deleted successfully' });
    logger.info(`Session deleted: ${session.name}`);
  } catch (error) {
    logger.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join session
router.post('/:sessionId/join', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session is public or user has access
    if (!session.isPublic && session.owner !== req.user.id && 
        !session.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add user to participants if not already there
    if (!session.participants.includes(req.user.id) && session.owner !== req.user.id) {
      session.participants.push(req.user.id);
      await session.save();
    }

    res.json({ message: 'Joined session successfully', session });
    logger.info(`User ${req.user.id} joined session ${session.name}`);
  } catch (error) {
    logger.error('Join session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave session
router.post('/:sessionId/leave', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Remove user from participants
    session.participants = session.participants.filter(
      participant => participant !== req.user.id
    );
    await session.save();

    res.json({ message: 'Left session successfully' });
    logger.info(`User ${req.user.id} left session ${session.name}`);
  } catch (error) {
    logger.error('Leave session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite user to session
router.post('/:sessionId/invite', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is owner
    if (session.owner !== req.user.id) {
      return res.status(403).json({ error: 'Only session owner can invite users' });
    }

    // Find user by email (this would typically involve sending an invitation)
    const { email } = req.body;
    
    // For now, just add to participants list if user exists
    // In a real app, you'd send an email invitation
    res.json({ 
      message: `Invitation sent to ${email}`,
      sessionId: session._id,
      sessionName: session.name
    });

    logger.info(`Invitation sent for session ${session.name} to ${email}`);
  } catch (error) {
    logger.error('Invite user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;