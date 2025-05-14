const Task = require('../models/task.model');
const List = require('../models/list.model');
const Board = require('../models/board.model');
const Activity = require('../models/activity.model');

// Get all tasks for a list
exports.getTasks = async (req, res) => {
  try {
    const { listId } = req.params;
    
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tasks = await Task.find({ list: listId })
      .populate({
        path: 'assignedTo',
        select: 'username avatar'
      })
      .sort({ order: 1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, dueDate, labels } = req.body;
    
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get the highest order value to place new task at the end
    const highestOrderTask = await Task.findOne({ list: listId })
      .sort({ order: -1 });
    
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;
    
    const task = new Task({
      title,
      description: description || '',
      list: listId,
      board: list.board,
      dueDate,
      labels: labels || [],
      order,
      createdBy: req.user.id
    });
    
    await task.save();
    
    // Record activity
    const activity = new Activity({
      text: `added task "${title}"`,
      user: req.user.id,
      board: list.board,
      list: listId,
      task: task._id,
      actionType: 'create'
    });
    
    await activity.save();
    
    // Populate assignedTo field
    const populatedTask = await Task.findById(task._id)
      .populate({
        path: 'assignedTo',
        select: 'username avatar'
      });
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, labels, completed } = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const oldTitle = task.title;
    const oldCompleted = task.completed;
    
    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (labels) updateFields.labels = labels;
    if (completed !== undefined) updateFields.completed = completed;
    
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate({
      path: 'assignedTo',
      select: 'username avatar'
    });
    
    // Record activities
    const activities = [];
    
    if (title && title !== oldTitle) {
      activities.push({
        text: `renamed task "${oldTitle}" to "${title}"`,
        user: req.user.id,
        board: task.board,
        list: task.list,
        task: task._id,
        actionType: 'update'
      });
    }
    
    if (completed !== undefined && completed !== oldCompleted) {
      activities.push({
        text: completed ? `marked task "${task.title}" as complete` : `marked task "${task.title}" as incomplete`,
        user: req.user.id,
        board: task.board,
        list: task.list,
        task: task._id,
        actionType: completed ? 'complete' : 'update'
      });
    }
    
    if (activities.length > 0) {
      await Activity.insertMany(activities);
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Task.findByIdAndDelete(id);
    
    // Record activity
    const activity = new Activity({
      text: `deleted task "${task.title}"`,
      user: req.user.id,
      board: task.board,
      list: task.list,
      actionType: 'delete'
    });
    
    await activity.save();
    
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Move a task to a different list
exports.moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationListId, order } = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if destination list exists and belongs to the same board
    const destinationList = await List.findById(destinationListId);
    if (!destinationList) {
      return res.status(404).json({ message: 'Destination list not found' });
    }
    
    if (destinationList.board.toString() !== task.board.toString()) {
      return res.status(400).json({ message: 'Cannot move task to a list in a different board' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const sourceListId = task.list;
    const sourceList = await List.findById(sourceListId);
    
    // Update task with new list and order
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        $set: { 
          list: destinationListId,
          order: order
        } 
      },
      { new: true }
    ).populate({
      path: 'assignedTo',
      select: 'username avatar'
    });
    
    // Record activity only if list changed
    if (sourceListId.toString() !== destinationListId.toString()) {
      const activity = new Activity({
        text: `moved task "${task.title}" from list "${sourceList.title}" to "${destinationList.title}"`,
        user: req.user.id,
        board: task.board,
        list: destinationListId,
        task: task._id,
        actionType: 'move'
      });
      
      await activity.save();
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign a user to a task
exports.assignUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if the assigned user is a member of the board
    const isUserMember = board.members.some(member => 
      member.toString() === userId.toString()
    );
    
    if (!isUserMember) {
      return res.status(400).json({ message: 'User is not a member of this board' });
    }
    
    // Check if user is already assigned
    const isAlreadyAssigned = task.assignedTo.some(assignee => 
      assignee.toString() === userId.toString()
    );
    
    if (isAlreadyAssigned) {
      return res.status(400).json({ message: 'User is already assigned to this task' });
    }
    
    // Add user to assignedTo array
    task.assignedTo.push(userId);
    await task.save();
    
    // Record activity
    const activity = new Activity({
      text: `assigned a user to task "${task.title}"`,
      user: req.user.id,
      board: task.board,
      list: task.list,
      task: task._id,
      actionType: 'assign'
    });
    
    await activity.save();
    
    // Return updated task with populated assignedTo
    const updatedTask = await Task.findById(id)
      .populate({
        path: 'assignedTo',
        select: 'username avatar'
      });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Assign user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a user from a task
exports.removeAssignedUser = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    const isMember = board.members.some(member => 
      member.toString() === req.user.id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Remove user from assignedTo array
    task.assignedTo = task.assignedTo.filter(assignee => 
      assignee.toString() !== userId.toString()
    );
    
    await task.save();
    
    // Record activity
    const activity = new Activity({
      text: `removed an assignment from task "${task.title}"`,
      user: req.user.id,
      board: task.board,
      list: task.list,
      task: task._id,
      actionType: 'update'
    });
    
    await activity.save();
    
    // Return updated task with populated assignedTo
    const updatedTask = await Task.findById(id)
      .populate({
        path: 'assignedTo',
        select: 'username avatar'
      });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Remove assigned user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};