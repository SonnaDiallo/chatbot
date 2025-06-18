// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;
  
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       // Extraire le token
//       token = req.headers.authorization.split(' ')[1];
      
//       // Vérifier le token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       // Ajouter l'utilisateur à la requête
//       req.user = await User.findById(decoded.id).select('-password');
      
//       next();
//     } catch (error) {
//       res.status(401).json({ message: 'Non autorisé, token invalide' });
//     }
//   }
  
//   if (!token) {
//     res.status(401).json({ message: 'Non autorisé, aucun token' });
//   }
// };

// module.exports = { protect };

// middleware/authMiddleware.js
const admin = require('firebase-admin');
const User = require('../models/User');

// Initialise Firebase Admin avec ta clé privée
const serviceAccount = require('../config/firebaseServiceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: decodedToken.email });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé dans la base' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token Firebase :', error);
    res.status(401).json({ message: 'Token Firebase invalide ou expiré' });
  }
};

module.exports = { protect };
