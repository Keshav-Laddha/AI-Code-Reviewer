const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const socketHandler = require('./socket/socketHandler');
const sessionRoutes = require('./routes/sessions');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Collaboration Service' });
});

// Routes
app.use('/sessions', sessionRoutes);

// Socket handling
socketHandler(io);

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  logger.info(`Collaboration Service running on port ${PORT}`);
});

module.exports = app;