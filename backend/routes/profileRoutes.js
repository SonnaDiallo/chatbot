const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Route protégée pour récupérer les infos utilisateur
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

module.exports = router;
// Cette route utilise bien le token d’identification pour trouver l’utilisateur et renvoyer ses vrais champs.

