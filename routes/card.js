// routes/card.routes.js
const express = require('express');
const router = express.Router();
const { 
  getCards, 
  getCard, 
  createCard, 
  updateCard, 
  deleteCard,
  moveCard,
  assignUser,
  unassignUser
} = require('../controllers/card.controller');
const auth = require('../middlewares/auth.middleware');

router.route('/lists/:listId/cards')
  .get(auth, getCards)
  .post(auth, createCard);

router.route('/cards/:id')
  .get(auth, getCard)
  .put(auth, updateCard)
  .delete(auth, deleteCard);

router.route('/cards/:id/move')
  .put(auth, moveCard);

router.route('/cards/:id/assign')
  .post(auth, assignUser);

router.route('/cards/:id/assign/:userId')
  .delete(auth, unassignUser);

module.exports = router;