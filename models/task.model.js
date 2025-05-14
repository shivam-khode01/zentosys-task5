const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  list: {
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    color: {
      type: String,
      enum: ['green', 'yellow', 'orange', 'red', 'purple', 'blue'],
      default: 'blue'
    },
    text: {
      type: String,
      trim: true,
      maxlength: 20
    }
  }],
  dueDate: {
    type: Date
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
TaskSchema.index({ list: 1, order: 1 });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;