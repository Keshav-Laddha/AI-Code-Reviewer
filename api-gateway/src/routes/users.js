const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile with avatar upload (POST /api/profile/update)
router.post('/profile/update', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (preferences) {
      let prefs = preferences;
      if (typeof preferences === 'string') {
        try { prefs = JSON.parse(preferences); } catch {}
      }
      updateData.preferences = { ...req.user.preferences, ...prefs };
    }
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    updateData.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user, avatarUrl: user.avatar });
    logger.info(`User profile updated (with avatar): ${user.email}`);
  } catch (error) {
    logger.error('Update profile (avatar) error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (JSON only, no avatar)
router.put('/profile', authMiddleware, [
  //body('name').optional().trim().isLength({ min: 2 }),
  //body('email').optional().isEmail().normalizeEmail(),
  body('preferences.theme').optional().isIn(['light', 'dark']),
  body('preferences.notifications').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //const { name, email, preferences, avatar } = req.body;
    const {preferences} = req.body;
    const updateData = {};

    // if (name) updateData.name = name;
    // if (email) updateData.email = email;
    // if (preferences) updateData.preferences = { ...updateData.preferences, ...preferences };
    // if (avatar) updateData.avatar = avatar;

    const userFromDb = await User.findById(req.user.id);
    if (!userFromDb) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (preferences) {
      updateData.preferences = { ...userFromDb.preferences.toObject(), ...preferences };
    }

    updateData.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
    logger.info(`User profile updated: ${user.email}`);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ... keep your other routes (get all users, delete, etc) ...

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:userId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
    logger.info(`User deleted: ${user.email}`);
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;