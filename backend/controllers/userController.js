const User = require('../models/User');

const registerUser = async (req, res) => {
  const { uid, firstname, lastname, birthdate, email } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const user = new User({
      uid,
      firstname,
      lastname,
      birthdate,
      email,
      registrationDate: new Date()
    });

    await user.save();
    res.status(201).json({ message: 'Utilisateur enregistré', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = { registerUser, getProfile };
