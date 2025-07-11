const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const activeUsers = new Map();
const activeSessions = new Map();

function socketHandler(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userSession = await redis.get(`user:${decoded.userId}`);

            if (!userSession) {
                return next(new Error('Invalid session'));
            }

            try {
                socket.user = typeof userSession === 'string' ? JSON.parse(userSession) : userSession;
            } catch (e) {
                logger.error('Socket user parse error:', e);
                return next(new Error('Invalid session data'));
            }
            next();
        } catch (error) {
            logger.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user.email}`);

        // Add user to active users
        activeUsers.set(socket.id, {
            ...socket.user,
            socketId: socket.id,
            joinedAt: new Date()
        });

        // Join session
        socket.on('joinSession', async (sessionId) => {
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Check permissions
                if (!session.participants.includes(socket.user.id) && session.owner !== socket.user.id) {
                    socket.emit('error', { message: 'Access denied' });
                    return;
                }

                socket.join(sessionId);
                socket.currentSession = sessionId;

                // Add to active sessions
                if (!activeSessions.has(sessionId)) {
                    activeSessions.set(sessionId, {
                        participants: new Map(),
                        code: session.code || '',
                        language: session.language || 'javascript',
                        cursor: {},
                        lastActivity: new Date()
                    });
                }

                const sessionData = activeSessions.get(sessionId);
                sessionData.participants.set(socket.id, socket.user);

                // Send current session state
                socket.emit('sessionJoined', {
                    sessionId,
                    code: sessionData.code,
                    language: sessionData.language,
                    participants: Array.from(sessionData.participants.values())
                });

                // Notify other participants
                socket.to(sessionId).emit('userJoined', {
                    user: socket.user,
                    participantCount: sessionData.participants.size
                });

                logger.info(`User ${socket.user.email} joined session ${sessionId}`);
            } catch (error) {
                logger.error('Join session error:', error);
                socket.emit('error', { message: 'Failed to join session' });
            }
        });

        // Handle code changes
        socket.on('codeChange', async (data) => {
            try {
                const { sessionId, code, changes } = data;
                const sessionData = activeSessions.get(sessionId);

                if (!sessionData) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                // Update session code
                sessionData.code = code;
                sessionData.lastActivity = new Date();

                // Broadcast to other participants
                socket.to(sessionId).emit('codeChange', {
                    code,
                    changes,
                    author: socket.user
                });

                // Cache in Redis
                await redis.set(`session:${sessionId}:code`, code, 'EX', 3600);

                logger.info(`Code change in session ${sessionId} by ${socket.user.email}`);
            } catch (error) {
                logger.error('Code change error:', error);
                socket.emit('error', { message: 'Failed to process code change' });
            }
        });

        // Handle cursor position
        socket.on('cursorPosition', (data) => {
            const { sessionId, position } = data;
            const sessionData = activeSessions.get(sessionId);

            if (sessionData) {
                sessionData.cursor[socket.id] = {
                    user: socket.user,
                    position,
                    timestamp: new Date()
                };

                socket.to(sessionId).emit('cursorPosition', {
                    userId: socket.user.id,
                    user: socket.user,
                    position
                });
            }
        });

        // Handle comments
        socket.on('addComment', async (data) => {
            try {
                const { sessionId, comment } = data;
                const commentId = uuidv4();

                const commentData = {
                    id: commentId,
                    ...comment,
                    author: socket.user,
                    timestamp: new Date()
                };

                // Store comment in database
                await Session.findByIdAndUpdate(sessionId, {
                    $push: { comments: commentData }
                });

                // Broadcast to all participants
                io.to(sessionId).emit('commentAdded', commentData);

                logger.info(`Comment added in session ${sessionId} by ${socket.user.email}`);
            } catch (error) {
                logger.error('Add comment error:', error);
                socket.emit('error', { message: 'Failed to add comment' });
            }
        });

        // Handle AI review request
        socket.on('requestAIReview', async (data) => {
            try {
                const { sessionId, code, language } = data;

                // Emit to session participants that review is being processed
                io.to(sessionId).emit('reviewStarted', {
                    requestedBy: socket.user
                });

                // This would typically make a request to the AI service
                // For now, we'll simulate it
                setTimeout(() => {
                    io.to(sessionId).emit('reviewCompleted', {
                        reviewId: uuidv4(),
                        requestedBy: socket.user,
                        result: {
                            summary: 'AI review completed',
                            issues: [],
                            suggestions: []
                        }
                    });
                }, 3000);

                logger.info(`AI review requested in session ${sessionId} by ${socket.user.email}`);
            } catch (error) {
                logger.error('AI review request error:', error);
                socket.emit('error', { message: 'Failed to request AI review' });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { sessionId, isTyping } = data;
            socket.to(sessionId).emit('userTyping', {
                userId: socket.user.id,
                user: socket.user,
                isTyping
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.user.email}`);

            // Remove from active users
            activeUsers.delete(socket.id);

            // Remove from active sessions
            if (socket.currentSession) {
                const sessionData = activeSessions.get(socket.currentSession);
                if (sessionData) {
                    sessionData.participants.delete(socket.id);
                    delete sessionData.cursor[socket.id];

                    // Notify other participants
                    socket.to(socket.currentSession).emit('userLeft', {
                        user: socket.user,
                        participantCount: sessionData.participants.size
                    });

                    // Clean up empty sessions
                    if (sessionData.participants.size === 0) {
                        activeSessions.delete(socket.currentSession);
                    }
                }
            }
        });
    });
}

module.exports = socketHandler;