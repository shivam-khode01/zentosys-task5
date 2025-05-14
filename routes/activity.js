
// routes/activity.routes.js
const express = require('express');
const router = express.Router();
const { 
  getBoardActivities 
} = require('../controllers/activity.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/boards/:boardId/activities', auth, getBoardActivities);

module.exports = router;