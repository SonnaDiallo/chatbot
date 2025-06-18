const express = require('express');
const router = express.Router();
const { 
  createConversation, 
  getUserConversations, 
  getConversation, 
  deleteConversation 
} = require('../controllers/conversationController');
// const { addMessage, getMessages } = require('../controllers/messageController');
const { addMessage, getMessages, regenerateAIResponse } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes sont protégées
router.use(protect);

router.route('/')
  .post(createConversation)
  .get(getUserConversations);

router.route('/:id')
  .get(getConversation)
  .delete(deleteConversation);

router.route('/:id/messages')
  .post(addMessage)
  .get(getMessages);

router.post('/:id/messages/:messageId/regenerate', regenerateAIResponse);


module.exports = router;