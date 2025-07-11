const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    required: true
  },
  participants: [{
    type: String
  }],
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  comments: [{
    id: String,
    line: Number,
    text: String,
    author: {
      id: String,
      name: String,
      email: String
    },
    timestamp: Date
  }],
  reviews: [{
    id: String,
    requestedBy: {
      id: String,
      name: String,
      email: String
    },
    result: mongoose.Schema.Types.Mixed,
    timestamp: Date
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-code-review', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose.model('Session', sessionSchema);