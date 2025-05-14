// controllers/list.controller.js
const List = require('../models/list.model');
const Card = require('../models/card.model');
const Board = require('../models/board.model');
const Activity = require('../models/activity.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.middleware');

// @desc    Get all lists for a board
// @route   GET /api/boards/:boardId/lists
// @access  Private
exports.getLists = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.boardId);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.boardId}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access lists on this board`, 401));
  }

  const lists = await List.find({ board: req.params.boardId }).sort('order');

  res.status(200).json({
    success: true,
    count: lists.length,
    data: lists
  });
});

// @desc    Create a new list
// @route   POST /api/boards/:boardId/lists
// @access  Private
exports.createList = asyncHandler(async (req, res, next) => {
  req.body.board = req.params.boardId;

  const board = await Board.findById(req.params.boardId);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.boardId}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add lists to this board`, 401));
  }

  // Set the order to be at the end
  const lastList = await List.findOne({ board: req.params.boardId }).sort('-order');
  req.body.order = lastList ? lastList.order + 1 : 0;

  const list = await List.create(req.body);

  // Create activity
  await Activity.create({
    text: `added ${list.title} to this board`,
    type: 'list',
    board: req.params.boardId,
    list: list._id,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: list
  });
});

// @desc    Update a list
// @route   PUT /api/lists/:id
// @access  Private
exports.updateList = asyncHandler(async (req, res, next) => {
  let list = await List.findById(req.params.id);

  if (!list) {
    return next(new ErrorResponse(`List not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(list.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${list.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update lists on this board`, 401));
  }

  list = await List.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Create activity
  await Activity.create({
    text: `updated ${list.title}`,
    type: 'list',
    board: list.board,
    list: list._id,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: list
  });
});

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private
exports.deleteList = asyncHandler(async (req, res, next) => {
  const list = await List.findById(req.params.id);

  if (!list) {
    return next(new ErrorResponse(`List not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(list.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${list.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete lists on this board`, 401));
  }

  // Delete all cards in this list
  await Card.deleteMany({ list: req.params.id });

  await list.remove();

  // Create activity
  await Activity.create({
    text: `deleted list ${list.title}`,
    type: 'list',
    board: list.board,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Reorder lists in a board
// @route   PUT /api/boards/:boardId/lists/reorder
// @access  Private
exports.reorderLists = asyncHandler(async (req, res, next) => {
  const { lists } = req.body;

  if (!lists || !Array.isArray(lists)) {
    return next(new ErrorResponse('Please provide a valid lists array', 400));
  }

  const board = await Board.findById(req.params.boardId);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.boardId}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to reorder lists on this board`, 401));
  }

  // Update each list's order
  for (const item of lists) {
    await List.findByIdAndUpdate(item.id, { order: item.order });
  }

  // Create activity
  await Activity.create({
    text: `reordered lists on this board`,
    type: 'board',
    board: req.params.boardId,
    user: req.user.id
  });

  const updatedLists = await List.find({ board: req.params.boardId }).sort('order');

  res.status(200).json({
    success: true,
    data: updatedLists
  });
});