// controllers/card.controller.js
const Card = require('../models/card.model');
const List = require('../models/list.model');
const Board = require('../models/board.model');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.middleware');

// @desc    Get all cards for a list
// @route   GET /api/lists/:listId/cards
// @access  Private
exports.getCards = asyncHandler(async (req, res, next) => {
  const list = await List.findById(req.params.listId);

  if (!list) {
    return next(new ErrorResponse(`List not found with id of ${req.params.listId}`, 404));
  }

  // Get the board
  const board = await Board.findById(list.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${list.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access cards on this list`, 401));
  }

  const cards = await Card.find({ list: req.params.listId })
    .sort('order')
    .populate({
      path: 'assignedTo',
      select: 'name avatar'
    })
    .populate({
      path: 'createdBy',
      select: 'name avatar'
    });

  res.status(200).json({
    success: true,
    count: cards.length,
    data: cards
  });
});

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
exports.getCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.params.id)
    .populate({
      path: 'assignedTo',
      select: 'name avatar'
    })
    .populate({
      path: 'createdBy',
      select: 'name avatar'
    })
    .populate({
      path: 'list',
      select: 'title'
    });

  if (!card) {
    return next(new ErrorResponse(`Card not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(card.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${card.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this card`, 401));
  }

  res.status(200).json({
    success: true,
    data: card
  });
});

// @desc    Create a new card
// @route   POST /api/lists/:listId/cards
// @access  Private
exports.createCard = asyncHandler(async (req, res, next) => {
  req.body.list = req.params.listId;
  req.body.createdBy = req.user.id;

  const list = await List.findById(req.params.listId);

  if (!list) {
    return next(new ErrorResponse(`List not found with id of ${req.params.listId}`, 404));
  }

  // Set the board
  req.body.board = list.board;

  // Get the board
  const board = await Board.findById(list.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${list.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add cards to this list`, 401));
  }

  // Set the order to be at the end
  const lastCard = await Card.findOne({ list: req.params.listId }).sort('-order');
  req.body.order = lastCard ? lastCard.order + 1 : 0;

  const card = await Card.create(req.body);

  // Create activity
  await Activity.create({
    text: `added card "${card.title}" to ${list.title}`,
    type: 'card',
    board: list.board,
    list: list._id,
    card: card._id,
    user: req.user.id
  });

  res.status(201).json({
    success: true,
    data: card
  });
});

// @desc    Update a card
// @route   PUT /api/cards/:id
// @access  Private
exports.updateCard = asyncHandler(async (req, res, next) => {
  let card = await Card.findById(req.params.id);

  if (!card) {
    return next(new ErrorResponse(`Card not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(card.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${card.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this card`, 401));
  }

  card = await Card.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate({
      path: 'assignedTo',
      select: 'name avatar'
    });

  // Create activity
  await Activity.create({
    text: `updated card "${card.title}"`,
    type: 'card',
    board: card.board,
    list: card.list,
    card: card._id,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: card
  });
});

// @desc    Delete a card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.params.id);

  if (!card) {
    return next(new ErrorResponse(`Card not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(card.board);

  if (!board) {
    return next(new ErrorResponse(`Board not found with id of ${card.board}`, 404));
  }

  // Make sure user is board owner or a member
  if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this card`, 401));
  }

  await card.remove();

  // Create activity
  await Activity.create({
    text: `deleted card "${card.title}"`,
    type: 'card',
    board: card.board,
    list: card.list,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Move a card to another list
// @route   PUT /api/cards/:id/move
// @access  Private
exports.moveCard = asyncHandler(async (req, res, next) => {
  const { listId, order } = req.body;

  if (!listId || order === undefined) {
    return next(new ErrorResponse('Please provide listId and order', 400));
  }

  let card = await Card.findById(req.params.id);

  if (!card) {
    return next(new ErrorResponse(`Card not found with id of ${req.params.id}`, 404));
  }

  // Get the board
  const board = await Board.findById(card.board);
    if (!board) {
        return next(new ErrorResponse(`Board not found with id of ${card.board}`, 404));
    }else{
        // Make sure user is board owner or a member
        if (board.owner.toString() !== req.user.id && !board.members.includes(req.user.id)) {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to move this card`, 401));
        }
    }
});