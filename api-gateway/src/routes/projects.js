const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const logger = require('../utils/logger');

const router = express.Router();

// Get user projects
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });

    const total = await Project.countDocuments({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });

    res.json({
      projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProjects: total
      }
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new project
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('description').optional().trim(),
  body('language').optional().isString(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, language, isPublic } = req.body;

    const project = new Project({
      name,
      description,
      language: language || 'javascript',
      owner: req.user.id,
      isPublic: isPublic || false,
      files: [],
      collaborators: []
    });

    await project.save();
    await project.populate('owner', 'name email');

    res.status(201).json(project);
    logger.info(`Project created: ${name} by ${req.user.email}`);
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get specific project
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email')
      .populate('collaborators', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access permissions
    const hasAccess = project.owner._id.toString() === req.user.id ||
                     project.collaborators.some(c => c._id.toString() === req.user.id) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:projectId', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('language').optional().isString(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only project owner can update' });
    }

    const updateData = req.body;
    updateData.updatedAt = Date.now();

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email').populate('collaborators', 'name email');

    res.json(updatedProject);
    logger.info(`Project updated: ${updatedProject.name}`);
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only project owner can delete' });
    }

    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: 'Project deleted successfully' });
    logger.info(`Project deleted: ${project.name}`);
  } catch (error) {
    logger.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add collaborator
router.post('/:projectId/collaborators', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only project owner can add collaborators' });
    }

    const User = require('../models/User');
    const collaborator = await User.findOne({ email: req.body.email });
    if (!collaborator) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a collaborator
    if (project.collaborators.includes(collaborator._id)) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    project.collaborators.push(collaborator._id);
    await project.save();
    await project.populate('collaborators', 'name email');

    res.json(project);
    logger.info(`Collaborator added to ${project.name}: ${collaborator.email}`);
  } catch (error) {
    logger.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;