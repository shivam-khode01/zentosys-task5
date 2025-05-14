// models/card.model.js
const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    color: {
      type: String
    },
    text: {
      type: String
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Card', CardSchema);
