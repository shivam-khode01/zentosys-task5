const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');
const auth = require('../middlewares/auth.middleware');

// @route   GET api/boards/:boardId/lists
// @desc    Get all lists for a board
// @access  Private
router.get('/boards/:boardId/lists', auth, listController.getLists);

// @route   POST api/boards/:boardId/lists
// @desc    Create a new list
// @access  Private
router.post('/boards/:boardId/lists', auth, listController.createList);

// @route   PUT api/lists/:id
// @desc    Update a list
// @access  Private
router.put('/lists/:id', auth, listController.updateList);

// @route   DELETE api/lists/:id
// @desc    Delete a list
// @access  Private
router.delete('/lists/:id', auth, listController.deleteList);

// @route   PUT api/boards/:boardId/lists/reorder
// @desc    Reorder lists in a board
// @access  Private
router.put('/boards/:boardId/lists/reorder', auth, listController.reorderLists);

module.exports = router;