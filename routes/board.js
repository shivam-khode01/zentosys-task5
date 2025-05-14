// routes/board.routes.js
const express = require('express');
const router = express.Router();
const { 
  getBoards, 
  getBoard, 
  createBoard, 
  updateBoard, 
  deleteBoard,
  addMember,
  removeMember
} = require('../controllers/board.controller');
const auth = require('../middlewares/auth.middleware');

router.route('/')
  .get(auth, getBoards)
  .post(auth, createBoard);

router.route('/:id')
  .get(auth, getBoard)
  .put(auth, updateBoard)
  .delete(auth, deleteBoard);

router.route('/:id/members')
  .put(auth, addMember);

router.route('/:id/members/:userId')
  .delete(auth, removeMember);

module.exports = router;