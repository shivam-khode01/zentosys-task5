// models/activity.model.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['board', 'list', 'card'],
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
