// controllers/board.controller.js
const Board = require('../models/board.model');
const List = require('../models/list.model');
const Card = require('../models/card.model');
const Activity = require('../models/activity.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.middleware');

// @desc    Get all boards for a user
// @route   GET /api/boards
// @access  Private
exports.getBoards = asyncHandler(async (req, res, next) => {
  const boards = await Board.find({ 
    $or: [
      { owner: req.user.id },
      { members: req.user.id }
    ]
  });

  res.status(200).json({
    success: true,
    count: boards.length,
    data: boards
  });
});

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
exports.getBoard = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.id)
    .populate({
      path: 'owner',
      select: 'name email avatar'
    })
    .populate({
      path: 'members',
      select: 'name email avatar'
    });

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.some(member => member._id.toString() === req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this board`, 401));
  }

  res.status(200).json({
    success: true,
    data: board
  });
});

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
exports.createBoard = asyncHandler(async (req, res, next) => {
  // Add owner to req.body
  req.body.owner = req.user.id;

  const board = await Board.create(req.body);

  // Create activity
  await Activity.create({
    text: `created this board`,
    type: 'board',
    board: board._id,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: board
  });
});

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
exports.updateBoard = asyncHandler(async (req, res, next) => {
  let board = await Board.findById(req.params.id);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is board owner
  if (board.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this board`, 401));
  }

  board = await Board.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Create activity
  await Activity.create({
    text: `updated this board`,
    type: 'board',
    board: board._id,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: board
  });
});

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
exports.deleteBoard = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is board owner
  if (board.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this board`, 401));
  }

  // Delete all associated lists, cards, and activities
  await List.deleteMany({ board: req.params.id });
  await Card.deleteMany({ board: req.params.id });
  await Activity.deleteMany({ board: req.params.id });

  await board.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add member to board
// @route   PUT /api/boards/:id/members
// @access  Private
exports.addMember = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  let board = await Board.findById(req.params.id);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is board owner
  if (board.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add members to this board`, 401));
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(`User with email ${email} not found`, 404));
  }

  // Check if user is already a member
  if (board.members.includes(user._id)) {
    return next(new ErrorResponse(`User with email ${email} is already a member of this board`, 400));
  }

  board = await Board.findByIdAndUpdate(
    req.params.id,
    { $push: { members: user._id } },
    { new: true }
  )
    .populate({
      path: 'members',
      select: 'name email avatar'
    });

  // Create activity
  await Activity.create({
    text: `added ${user.name} to this board`,
    type: 'board',
    board: board._id,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: board
  });
});

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private
exports.removeMember = asyncHandler(async (req, res, next) => {
  let board = await Board.findById(req.params.id);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is board owner
  if (board.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to remove members from this board`, 401));
  }

  // Get user to remove
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
  }

  board = await Board.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: req.params.userId } },
    { new: true }
  )
    .populate({
      path: 'members',
      select: 'name email avatar'
    });

  // Create activity
  await Activity.create({
    text: `removed ${user.name} from this board`,
    type: 'board',
    board: board._id,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: board
  });
});