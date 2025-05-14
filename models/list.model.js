// models/list.model.js
const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('List', ListSchema);
