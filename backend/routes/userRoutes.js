const express = require('express');
const router = express.Router();
const { registerUser, getProfile } = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.get('/profile/me', authenticate, getProfile);

module.exports = router;
