// // server.js - Version finale qui FONCTIONNE
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const path = require('path');

// // Chargement des variables d'environnement
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ⚠️ CORS DOIT ÊTRE CONFIGURÉ EN PREMIER
// app.use(cors({
//   origin: '*', // Accepter toutes les origines pour le développement
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Middleware pour parser JSON
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Middleware de logging pour debug
// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`${timestamp} - ${req.method} ${req.path}`);
  
//   if (req.headers.authorization) {
//     console.log('🔑 Authorization header présent');
//   }
  
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log('📦 Body:', JSON.stringify(req.body, null, 2));
//   }
  
//   next();
// });

// // URL MongoDB - CHANGEZ CETTE URL SELON VOTRE CONFIGURATION
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot';

// // Connexion MongoDB
// const connectDB = async () => {
//   try {
//     // Essayer plusieurs configurations MongoDB
//     const mongoOptions = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     };

//     console.log('🔄 Tentative de connexion MongoDB...');
//     console.log('📍 URI:', MONGODB_URI);
    
//     await mongoose.connect(MONGODB_URI, mongoOptions);
//     console.log('✅ MongoDB connecté avec succès');
//     console.log('🏢 Base de données:', mongoose.connection.name);
    
//   } catch (error) {
//     console.error('❌ Erreur MongoDB:', error.message);
//     console.log('⚠️ Le serveur continuera sans MongoDB (mode dégradé)');
//     // Ne pas arrêter le serveur
//   }
// };

// // Schéma utilisateur MongoDB
// const userSchema = new mongoose.Schema({
//   uid: { type: String, required: true, unique: true },
//   firstname: { type: String, required: true },
//   lastname: { type: String, required: true },
//   birthdate: { type: String },
//   email: { type: String, required: true, unique: true },
//   registrationDate: { type: Date, default: Date.now },
//   lastLogin: { type: Date, default: Date.now }
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);

// // Middleware d'authentification Firebase (simplifié)
// const authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       console.log('🔐 Token reçu:', token.substring(0, 20) + '...');
//       // Pour le moment, on fait confiance au token (à améliorer avec Firebase Admin)
//       req.userToken = token;
//     }
//     next();
//   } catch (error) {
//     console.log('⚠️ Erreur token:', error.message);
//     next(); // Continuer même sans token valide
//   }
// };

// // 🏠 ROUTES API

// // Route de test - TRÈS IMPORTANTE
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'API ChatBot Backend en ligne',
//     timestamp: new Date(),
//     status: 'running',
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
//   });
// });

// // Route de test API
// app.get('/api', (req, res) => {
//   res.json({ 
//     message: 'API du ChatBot est en ligne', 
//     timestamp: new Date(),
//     cors: 'enabled',
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     routes: [
//       'GET /api',
//       'POST /api/users/register', 
//       'GET /api/users/:uid',
//       'POST /api/users/login'
//     ]
//   });
// });

// // 📝 Route d'inscription
// app.post('/api/users/register', authenticateToken, async (req, res) => {
//   try {
//     console.log('📝 === INSCRIPTION ===');
//     console.log('Données reçues:', req.body);
    
//     const { uid, firstname, lastname, birthdate, email } = req.body;
    
//     // Validation des données
//     if (!uid || !firstname || !lastname || !email) {
//       console.log('❌ Données manquantes');
//       return res.status(400).json({ 
//         error: 'Données manquantes',
//         required: ['uid', 'firstname', 'lastname', 'email'],
//         received: { 
//           uid: !!uid, 
//           firstname: !!firstname, 
//           lastname: !!lastname, 
//           email: !!email 
//         }
//       });
//     }

//     let savedUser = null;

//     // Si MongoDB est connecté, sauvegarder en base
//     if (mongoose.connection.readyState === 1) {
//       try {
//         // Vérifier si l'utilisateur existe déjà
//         const existingUser = await User.findOne({ $or: [{ uid }, { email }] });
//         if (existingUser) {
//           console.log('⚠️ Utilisateur déjà existant:', existingUser._id);
//           return res.status(200).json({ 
//             message: 'Utilisateur déjà existant (pas d\'erreur)',
//             user: {
//               uid: existingUser.uid,
//               firstname: existingUser.firstname,
//               lastname: existingUser.lastname,
//               email: existingUser.email
//             }
//           });
//         }

//         // Créer nouvel utilisateur
//         const newUser = new User({
//           uid,
//           firstname,
//           lastname,
//           birthdate,
//           email
//         });

//         savedUser = await newUser.save();
//         console.log('✅ Utilisateur sauvegardé en MongoDB:', savedUser._id);
        
//       } catch (dbError) {
//         console.error('⚠️ Erreur MongoDB:', dbError.message);
//         // Continuer même si la base de données a un problème
//       }
//     } else {
//       console.log('⚠️ MongoDB non connecté, simulation de la sauvegarde');
//     }
    
//     console.log('✅ Inscription réussie pour:', uid);
//     res.status(201).json({ 
//       message: 'Utilisateur enregistré avec succès',
//       user: {
//         uid,
//         firstname,
//         lastname,
//         email,
//         registrationDate: savedUser?.registrationDate || new Date()
//       },
//       mongodb: mongoose.connection.readyState === 1
//     });

//   } catch (error) {
//     console.error('❌ Erreur lors de l\'enregistrement:', error);
//     res.status(500).json({ 
//       error: 'Erreur interne du serveur',
//       details: error.message 
//     });
//   }
// });

// // 🔍 Route pour récupérer un utilisateur par UID
// app.get('/api/users/:uid', authenticateToken, async (req, res) => {
//   try {
//     console.log('🔍 === RÉCUPÉRATION UTILISATEUR ===');
//     const { uid } = req.params;
//     console.log('UID recherché:', uid);
    
//     if (!uid) {
//       return res.status(400).json({ error: 'UID manquant' });
//     }

//     let user = null;

//     // Si MongoDB est connecté, récupérer depuis la base
//     if (mongoose.connection.readyState === 1) {
//       try {
//         user = await User.findOne({ uid });
//         console.log('👤 Utilisateur trouvé en base:', !!user);
        
//         if (user) {
//           // Mettre à jour la dernière connexion
//           user.lastLogin = new Date();
//           await user.save();
//         }
//       } catch (dbError) {
//         console.error('⚠️ Erreur MongoDB:', dbError.message);
//       }
//     }

//     if (user) {
//       res.status(200).json({
//         message: 'Utilisateur trouvé',
//         user: {
//           uid: user.uid,
//           firstname: user.firstname,
//           lastname: user.lastname,
//           email: user.email,
//           birthdate: user.birthdate,
//           registrationDate: user.registrationDate,
//           lastLogin: user.lastLogin
//         }
//       });
//     } else {
//       // Utilisateur pas trouvé en base, retourner des données par défaut
//       console.log('⚠️ Utilisateur non trouvé en base');
//       res.status(404).json({ 
//         error: 'Utilisateur non trouvé en base de données',
//         suggestion: 'L\'utilisateur existe peut-être seulement dans Firebase'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Erreur lors de la récupération:', error);
//     res.status(500).json({ 
//       error: 'Erreur interne du serveur',
//       details: error.message 
//     });
//   }
// });

// // 🔐 Route de connexion (bonus)
// app.post('/api/users/login', authenticateToken, async (req, res) => {
//   try {
//     console.log('🔐 === CONNEXION ===');
//     const { uid } = req.body;
    
//     if (!uid) {
//       return res.status(400).json({ error: 'UID manquant' });
//     }

//     if (mongoose.connection.readyState === 1) {
//       const user = await User.findOneAndUpdate(
//         { uid },
//         { lastLogin: new Date() },
//         { new: true }
//       );

//       if (user) {
//         console.log('✅ Connexion enregistrée pour:', user.email);
//         return res.status(200).json({
//           message: 'Connexion réussie',
//           user: {
//             uid: user.uid,
//             firstname: user.firstname,
//             lastname: user.lastname,
//             email: user.email
//           }
//         });
//       }
//     }

//     res.status(200).json({
//       message: 'Connexion acceptée (mode dégradé)',
//       uid
//     });

//   } catch (error) {
//     console.error('❌ Erreur lors de la connexion:', error);
//     res.status(500).json({ error: 'Erreur interne du serveur' });
//   }
// });

// // Route OPTIONS pour CORS
// app.options('*', (req, res) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
//   res.sendStatus(200);
// });

// // Servir les fichiers statiques du frontend
// app.use(express.static(path.join(__dirname, '../chatbot')));

// // Route catch-all pour le frontend
// app.get('*', (req, res) => {
//   // Si c'est une route API, retourner 404
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ error: 'Route API non trouvée' });
//   }
  
//   // Sinon, servir le frontend
//   res.sendFile(path.join(__dirname, '../chatbot/Ai-connexion.html'));
// });

// // Gestion des erreurs globales
// app.use((error, req, res, next) => {
//   console.error('❌ Erreur globale:', error);
//   res.status(500).json({ 
//     error: 'Erreur interne du serveur',
//     message: error.message
//   });
// });

// // 🚀 Démarrage du serveur
// const startServer = async () => {
//   try {
//     // Tenter de se connecter à MongoDB
//     await connectDB();
    
//     app.listen(PORT, '0.0.0.0', () => {
//       console.log('\n🎉 ================================');
//       console.log('🚀 SERVEUR BACKEND DÉMARRÉ !');
//       console.log('================================');
//       console.log(`📍 URL: http://localhost:${PORT}`);
//       console.log(`🔗 API: http://localhost:${PORT}/api`);
//       console.log(`🌐 CORS: Activé (toutes origines)`);
//       console.log(`🗃️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Mode dégradé'}`);
//       console.log('================================\n');
      
//       console.log('📋 Routes disponibles:');
//       console.log('  GET  / (page d\'accueil)');
//       console.log('  GET  /api (test API)');
//       console.log('  POST /api/users/register');
//       console.log('  GET  /api/users/:uid');
//       console.log('  POST /api/users/login');
//       console.log('\n🔧 Prêt à recevoir les requêtes !');
//     });
//   } catch (error) {
//     console.error('❌ Erreur critique au démarrage:', error);
//     process.exit(1);
//   }
// };


// // Import des services
// const aiService = require('./services/aiService');
// const recommendationService = require('./services/recommendationService');

// // 🤖 Route pour les réponses IA (invités et utilisateurs connectés)
// app.post('/api/guest-response', async (req, res) => {
//   try {
//     console.log('🤖 === REQUÊTE IA ===');
//     console.log('Message reçu:', req.body.message);
    
//     const { message, conversationHistory = [] } = req.body;
    
//     if (!message || !message.trim()) {
//       return res.status(400).json({ 
//         error: 'Message requis',
//         message: 'Veuillez fournir un message à traiter'
//       });
//     }

//     // Récupérer le profil utilisateur si connecté
//     let userProfile = null;
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       try {
//         const token = authHeader.substring(7);
//         // Ici vous pourriez décoder le token pour récupérer l'utilisateur
//         // Pour l'instant, on continue sans profil spécifique
//         console.log('🔐 Utilisateur authentifié détecté');
//       } catch (tokenError) {
//         console.log('⚠️ Token invalide, continuons en mode invité');
//       }
//     }

//     console.log('🧠 Envoi vers OpenAI...');
    
//     // Appel au service IA
//     const aiResult = await aiService.generateResponse(
//       message.trim(), 
//       conversationHistory, 
//       userProfile
//     );
    
//     if (aiResult.success) {
//       console.log('✅ Réponse IA générée avec succès');
//       console.log('📊 Tokens utilisés:', aiResult.usage?.total_tokens || 'N/A');
      
//       res.json({ 
//         text: aiResult.response,
//         usage: aiResult.usage,
//         timestamp: new Date().toISOString()
//       });
//     } else {
//       console.error('❌ Erreur du service IA:', aiResult.error);
//       res.status(500).json({ 
//         error: 'Erreur du service IA',
//         message: aiResult.error,
//         details: aiResult.details
//       });
//     }
    
//   } catch (error) {
//     console.error('❌ Erreur dans guest-response:', error);
//     res.status(500).json({ 
//       error: 'Erreur interne du serveur',
//       message: error.message,
//       suggestion: 'Vérifiez votre clé API OpenAI et votre connexion internet'
//     });
//   }
// });

// // 📚 Route pour la recherche de cours
// app.get('/api/courses/search', async (req, res) => {
//   try {
//     console.log('📚 === RECHERCHE COURS ===');
//     const { query, category, level, limit = 5 } = req.query;
    
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         error: 'Base de données non disponible',
//         message: 'Le service de cours nécessite une connexion à la base de données'
//       });
//     }

//     // Importer le modèle Course
//     const Course = require('./models/course');
    
//     let searchQuery = {};
    
//     if (query) {
//       searchQuery.$or = [
//         { title: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { skills: { $in: [new RegExp(query, 'i')] } }
//       ];
//     }
    
//     if (category) {
//       searchQuery.category = category;
//     }
    
//     if (level) {
//       searchQuery.level = level;
//     }

//     const courses = await Course.find(searchQuery)
//       .sort({ rating: -1, enrolledCount: -1 })
//       .limit(parseInt(limit));

//     console.log(`✅ ${courses.length} cours trouvés`);
    
//     res.json({
//       courses: courses,
//       total: courses.length,
//       query: { query, category, level, limit }
//     });
    
//   } catch (error) {
//     console.error('❌ Erreur recherche cours:', error);
//     res.status(500).json({ 
//       error: 'Erreur lors de la recherche de cours',
//       message: error.message 
//     });
//   }
// });

// // 📚 Route pour les cours par catégorie
// app.get('/api/courses/category/:category', async (req, res) => {
//   try {
//     console.log('📚 === COURS PAR CATÉGORIE ===');
//     const { category } = req.params;
//     const { level, limit = 5 } = req.query;
    
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         error: 'Base de données non disponible'
//       });
//     }

//     const Course = require('./models/course');
    
//     let query = { category: decodeURIComponent(category) };
    
//     if (level) {
//       query.level = level;
//     }

//     const courses = await Course.find(query)
//       .sort({ rating: -1, enrolledCount: -1 })
//       .limit(parseInt(limit));

//     console.log(`✅ ${courses.length} cours trouvés pour ${category}`);
    
//     res.json({
//       courses: courses,
//       category: category,
//       total: courses.length
//     });
    
//   } catch (error) {
//     console.error('❌ Erreur cours par catégorie:', error);
//     res.status(500).json({ 
//       error: 'Erreur lors de la récupération des cours',
//       message: error.message 
//     });
//   }
// });

// // 🎯 Route pour les recommandations personnalisées
// app.get('/api/recommendations', async (req, res) => {
//   try {
//     console.log('🎯 === RECOMMANDATIONS ===');
//     const { userId, limit = 3 } = req.query;
    
//     let recommendations;
    
//     if (userId && mongoose.connection.readyState === 1) {
//       // Recommandations personnalisées
//       recommendations = await recommendationService.getPersonalizedRecommendations(
//         userId, 
//         parseInt(limit)
//       );
//     } else {
//       // Cours populaires par défaut
//       recommendations = await recommendationService.getPopularCourses(parseInt(limit));
//     }
    
//     console.log(`✅ ${recommendations.length} recommandations générées`);
    
//     res.json({
//       recommendations: recommendations,
//       personalized: !!userId,
//       total: recommendations.length
//     });
    
//   } catch (error) {
//     console.error('❌ Erreur recommandations:', error);
//     res.status(500).json({ 
//       error: 'Erreur lors de la génération des recommandations',
//       message: error.message 
//     });
//   }
// });

// console.log('✅ Routes IA et cours ajoutées au serveur');

// startServer();

// server.js - Version mise à jour avec gestion des conversations
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ CORS DOIT ÊTRE CONFIGURÉ EN PREMIER
app.use(cors({
  origin: '*', // Accepter toutes les origines pour le développement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-ID']
}));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging pour debug
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  
  if (req.headers.authorization) {
    console.log('🔑 Authorization header présent');
  }
  
  if (req.headers['x-user-id']) {
    console.log('👤 X-User-ID header:', req.headers['x-user-id']);
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
});

// URL MongoDB - CHANGEZ CETTE URL SELON VOTRE CONFIGURATION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot';

// Connexion MongoDB
const connectDB = async () => {
  try {
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log('🔄 Tentative de connexion MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, mongoOptions);
    console.log('✅ MongoDB connecté avec succès');
    console.log('🏢 Base de données:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    console.log('⚠️ Le serveur continuera sans MongoDB (mode dégradé)');
  }
};

// Schémas MongoDB
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  birthdate: { type: String },
  email: { type: String, required: true, unique: true },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// ⭐ NOUVEAU : Schéma Conversation
const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Nouvelle conversation'
  },
  userId: {
    type: String, // On utilise String pour l'UID Firebase
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// ⭐ NOUVEAU : Schéma Message
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);

// Middleware d'authentification Firebase (simplifié)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔐 Token reçu:', token.substring(0, 20) + '...');
      req.userToken = token;
    }
    next();
  } catch (error) {
    console.log('⚠️ Erreur token:', error.message);
    next();
  }
};

// Middleware pour extraire l'userId
// Dans server.js, méthode extractUserId
const extractUserId = (req, res, next) => {
    let userId = null;

    // 1. Depuis les headers personnalisés
    if (req.headers['x-user-id']) {
        userId = req.headers['x-user-id'];
        console.log('👤 UserId depuis header X-User-ID:', userId);
    }
    // 2. Depuis le body
    else if (req.body && req.body.userId) {
        userId = req.body.userId;
        console.log('👤 UserId depuis body:', userId);
    }

    req.extractedUserId = userId;
    
    if (userId) {
        console.log('✅ UserId extrait avec succès:', userId);
    } else {
        console.log('❌ Aucun userId trouvé');
    }

    next();
};

// 🏠 ROUTES API EXISTANTES

app.get('/', (req, res) => {
  res.json({ 
    message: 'API ChatBot Backend en ligne',
    timestamp: new Date(),
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API du ChatBot est en ligne', 
    timestamp: new Date(),
    cors: 'enabled',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    routes: [
      'GET /api',
      'POST /api/users/register', 
      'GET /api/users/:uid',
      'POST /api/users/login',
      'POST /api/guest-response',
      'GET /api/conversations',
      'POST /api/conversations',
      'DELETE /api/conversations/:id',
      'GET /api/conversations/:id/messages'
    ]
  });
});

// Vos routes existantes (register, login, etc.)
app.post('/api/users/register', authenticateToken, async (req, res) => {
  try {
    console.log('📝 === INSCRIPTION ===');
    console.log('Données reçues:', req.body);
    
    const { uid, firstname, lastname, birthdate, email } = req.body;
    
    if (!uid || !firstname || !lastname || !email) {
      console.log('❌ Données manquantes');
      return res.status(400).json({ 
        error: 'Données manquantes',
        required: ['uid', 'firstname', 'lastname', 'email'],
        received: { 
          uid: !!uid, 
          firstname: !!firstname, 
          lastname: !!lastname, 
          email: !!email 
        }
      });
    }

    let savedUser = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const existingUser = await User.findOne({ $or: [{ uid }, { email }] });
        if (existingUser) {
          console.log('⚠️ Utilisateur déjà existant:', existingUser._id);
          return res.status(200).json({ 
            message: 'Utilisateur déjà existant (pas d\'erreur)',
            user: {
              uid: existingUser.uid,
              firstname: existingUser.firstname,
              lastname: existingUser.lastname,
              email: existingUser.email
            }
          });
        }

        const newUser = new User({
          uid,
          firstname,
          lastname,
          birthdate,
          email
        });

        savedUser = await newUser.save();
        console.log('✅ Utilisateur sauvegardé en MongoDB:', savedUser._id);
        
      } catch (dbError) {
        console.error('⚠️ Erreur MongoDB:', dbError.message);
      }
    } else {
      console.log('⚠️ MongoDB non connecté, simulation de la sauvegarde');
    }
    
    console.log('✅ Inscription réussie pour:', uid);
    res.status(201).json({ 
      message: 'Utilisateur enregistré avec succès',
      user: {
        uid,
        firstname,
        lastname,
        email,
        registrationDate: savedUser?.registrationDate || new Date()
      },
      mongodb: mongoose.connection.readyState === 1
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

app.get('/api/users/:uid', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 === RÉCUPÉRATION UTILISATEUR ===');
    const { uid } = req.params;
    console.log('UID recherché:', uid);
    
    if (!uid) {
      return res.status(400).json({ error: 'UID manquant' });
    }

    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ uid });
        console.log('👤 Utilisateur trouvé en base:', !!user);
        
        if (user) {
          user.lastLogin = new Date();
          await user.save();
        }
      } catch (dbError) {
        console.error('⚠️ Erreur MongoDB:', dbError.message);
      }
    }

    if (user) {
      res.status(200).json({
        message: 'Utilisateur trouvé',
        user: {
          uid: user.uid,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          birthdate: user.birthdate,
          registrationDate: user.registrationDate,
          lastLogin: user.lastLogin
        }
      });
    } else {
      console.log('⚠️ Utilisateur non trouvé en base');
      res.status(404).json({ 
        error: 'Utilisateur non trouvé en base de données',
        suggestion: 'L\'utilisateur existe peut-être seulement dans Firebase'
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

app.post('/api/users/login', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 === CONNEXION ===');
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'UID manquant' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOneAndUpdate(
        { uid },
        { lastLogin: new Date() },
        { new: true }
      );

      if (user) {
        console.log('✅ Connexion enregistrée pour:', user.email);
        return res.status(200).json({
          message: 'Connexion réussie',
          user: {
            uid: user.uid,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
          }
        });
      }
    }

    res.status(200).json({
      message: 'Connexion acceptée (mode dégradé)',
      uid
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ⭐ NOUVELLES ROUTES CONVERSATIONS

// Fonction utilitaire pour générer un titre de conversation intelligent
function generateConversationTitle(message) {
  const cleanMessage = message.trim().toLowerCase();
  
  const keywords = {
    'développement': 'Apprentissage Développement',
    'développeur': 'Devenir Développeur',
    'web': 'Développement Web',
    'javascript': 'Formation JavaScript',
    'react': 'Formation React',
    'python': 'Formation Python',
    'cybersécurité': 'Formation Cybersécurité',
    'design': 'Formation Design',
    'formation': 'Recherche Formation',
    'cours': 'Recherche Cours',
    'apprendre': 'Apprentissage'
  };
  
  for (const [keyword, title] of Object.entries(keywords)) {
    if (cleanMessage.includes(keyword)) {
      return title;
    }
  }
  
  const truncated = message.substring(0, 50);
  return truncated.length < message.length ? truncated + '...' : truncated;
}

// Route pour créer une conversation
app.post('/api/conversations', extractUserId, async (req, res) => {
  try {
    console.log('🆕 === CRÉATION CONVERSATION ===');
    const { title } = req.body;
    const userId = req.extractedUserId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Utilisateur non authentifié',
        success: false
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Base de données non disponible',
        success: false
      });
    }

    const conversation = new Conversation({
      title: title || 'Nouvelle conversation',
      userId: userId,
      createdAt: new Date(),
      lastUpdated: new Date()
    });

    const savedConversation = await conversation.save();
    console.log('✅ Conversation créée:', savedConversation._id);

    res.status(201).json({
      conversation: savedConversation,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur création conversation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      success: false
    });
  }
});

// Route pour récupérer les conversations d'un utilisateur
app.get('/api/conversations', extractUserId, async (req, res) => {
  try {
    console.log('📚 === RÉCUPÉRATION CONVERSATIONS ===');
    const userId = req.extractedUserId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Utilisateur non authentifié',
        conversations: []
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Base de données non disponible',
        conversations: []
      });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ lastUpdated: -1 })
      .limit(50)
      .select('title createdAt lastUpdated');

    console.log(`✅ ${conversations.length} conversations trouvées`);

    res.json({ 
      conversations,
      total: conversations.length,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur récupération conversations:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      conversations: [],
      success: false
    });
  }
});

// Route pour récupérer les messages d'une conversation
app.get('/api/conversations/:conversationId/messages', extractUserId, async (req, res) => {
  try {
    console.log('💬 === RÉCUPÉRATION MESSAGES ===');
    const { conversationId } = req.params;
    const userId = req.extractedUserId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Utilisateur non authentifié',
        messages: []
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Base de données non disponible',
        messages: []
      });
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({ 
      _id: conversationId, 
      userId 
    });
    
    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation non trouvée',
        messages: []
      });
    }

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .select('text sender timestamp metadata');

    console.log(`✅ ${messages.length} messages récupérés`);

    res.json({ 
      messages,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        lastUpdated: conversation.lastUpdated
      },
      total: messages.length,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      messages: [],
      success: false
    });
  }
});

// Route pour supprimer une conversation
app.delete('/api/conversations/:conversationId', extractUserId, async (req, res) => {
  try {
    console.log('🗑️ === SUPPRESSION CONVERSATION ===');
    const { conversationId } = req.params;
    const userId = req.extractedUserId;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Utilisateur non authentifié',
        success: false
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Base de données non disponible',
        success: false
      });
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({ 
      _id: conversationId, 
      userId 
    });
    
    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation non trouvée',
        success: false
      });
    }

    // Supprimer tous les messages de la conversation
    await Message.deleteMany({ conversationId });
    
    // Supprimer la conversation
    await Conversation.findByIdAndDelete(conversationId);

    console.log('✅ Conversation supprimée:', conversationId);

    res.json({ 
      message: 'Conversation supprimée avec succès',
      deletedConversationId: conversationId,
      success: true
    });

  } catch (error) {
    console.error('❌ Erreur suppression conversation:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      success: false
    });
  }
});

// Import des services
const aiService = require('./services/aiService');
const recommendationService = require('./services/recommendationService');

// 🤖 Route pour les réponses IA MISE À JOUR avec sauvegarde
app.post('/api/guest-response', extractUserId, async (req, res) => {
  try {
    console.log('🤖 === REQUÊTE IA AVEC SAUVEGARDE ===');
    console.log('Message reçu:', req.body.message);
    
    const { message, conversationHistory = [], conversationId } = req.body;
    const userId = req.extractedUserId;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message requis',
        message: 'Veuillez fournir un message à traiter',
        success: false
      });
    }

    // 1. GÉRER LA CONVERSATION
    let currentConversationId = conversationId;
    let conversationCreated = false;
    
    if (mongoose.connection.readyState === 1) {
      try {
        // Si pas de conversationId et utilisateur connecté, créer une nouvelle conversation
        if (!currentConversationId && userId) {
          console.log('🆕 Création d\'une nouvelle conversation...');
          
          const title = generateConversationTitle(message);
          
          const newConversation = new Conversation({
            userId: userId,
            title: title,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
          
          const savedConversation = await newConversation.save();
          currentConversationId = savedConversation._id;
          conversationCreated = true;
          
          console.log('✅ Nouvelle conversation créée:', currentConversationId);
        }

        // Vérifier que la conversation existe et appartient à l'utilisateur
        if (currentConversationId && userId) {
          const existingConversation = await Conversation.findOne({
            _id: currentConversationId,
            userId: userId
          });
          
          if (!existingConversation) {
            console.log('⚠️ Conversation non trouvée ou accès non autorisé');
            currentConversationId = null;
          }
        }

        // Sauvegarder le message utilisateur
        if (currentConversationId) {
          const userMessage = new Message({
            text: message.trim(),
            sender: 'user',
            conversationId: currentConversationId,
            timestamp: new Date(),
            metadata: {
              userAgent: req.headers['user-agent'],
              ip: req.ip || req.connection.remoteAddress
            }
          });
          
          await userMessage.save();
          console.log('💬 Message utilisateur sauvegardé');
          
          // Mettre à jour la conversation
          await Conversation.findByIdAndUpdate(currentConversationId, {
            lastUpdated: new Date()
          });
        }
        
      } catch (dbError) {
        console.error('⚠️ Erreur base de données (message utilisateur):', dbError.message);
      }
    }

    console.log('🧠 Envoi vers le service IA...');
    
    // 2. APPEL AU SERVICE IA
    const aiResult = await aiService.generateResponse(
      message.trim(), 
      conversationHistory, 
      null // userProfile
    );
    
    if (aiResult.success) {
      console.log('✅ Réponse IA générée avec succès');
      console.log('📊 Tokens utilisés:', aiResult.usage?.total_tokens || 'N/A');
      
      // 3. SAUVEGARDER LA RÉPONSE IA
      if (mongoose.connection.readyState === 1 && currentConversationId) {
        try {
          const botMessage = new Message({
            text: aiResult.response,
            sender: 'bot',
            conversationId: currentConversationId,
            timestamp: new Date(),
            metadata: {
              tokensUsed: aiResult.usage?.total_tokens,
              model: 'gpt-3.5-turbo'
            }
          });
          
          await botMessage.save();
          console.log('🤖 Réponse IA sauvegardée');

          // Mettre à jour la conversation
          await Conversation.findByIdAndUpdate(currentConversationId, {
            lastUpdated: new Date()
          });
          
        } catch (dbError) {
          console.error('⚠️ Erreur sauvegarde réponse IA:', dbError.message);
        }
      }
      
      // 4. RÉPONSE AU CLIENT
      res.json({ 
        text: aiResult.response,
        conversationId: currentConversationId,
        conversationCreated: conversationCreated,
        usage: aiResult.usage,
        timestamp: new Date().toISOString(),
        success: true
      });
      
    } else {
      console.error('❌ Erreur du service IA:', aiResult.error);
      res.status(500).json({ 
        error: 'Erreur du service IA',
        message: aiResult.error,
        details: aiResult.details,
        success: false
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur dans guest-response:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      message: error.message,
      success: false
    });
  }
});

// Vos autres routes existantes (courses, etc.)
app.get('/api/courses/search', async (req, res) => {
  try {
    console.log('📚 === RECHERCHE COURS ===');
    const { query, category, level, limit = 5 } = req.query;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Base de données non disponible',
        message: 'Le service de cours nécessite une connexion à la base de données'
      });
    }

    const Course = require('./models/course');
    
    let searchQuery = {};
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (level) {
      searchQuery.level = level;
    }

    const courses = await Course.find(searchQuery)
      .sort({ rating: -1, enrolledCount: -1 })
      .limit(parseInt(limit));

    console.log(`✅ ${courses.length} cours trouvés`);
    
    res.json({
      courses: courses,
      total: courses.length,
      query: { query, category, level, limit }
    });
    
  } catch (error) {
    console.error('❌ Erreur recherche cours:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la recherche de cours',
      message: error.message 
    });
  }
});

app.get('/api/courses/category/:category', async (req, res) => {
  try {
    console.log('📚 === COURS PAR CATÉGORIE ===');
    const { category } = req.params;
    const { level, limit = 5 } = req.query;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Base de données non disponible'
      });
    }

    const Course = require('./models/course');
    
    let query = { category: decodeURIComponent(category) };
    
    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query)
      .sort({ rating: -1, enrolledCount: -1 })
      .limit(parseInt(limit));

    console.log(`✅ ${courses.length} cours trouvés pour ${category}`);
    
    res.json({
      courses: courses,
      category: category,
      total: courses.length
    });
    
  } catch (error) {
    console.error('❌ Erreur cours par catégorie:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des cours',
      message: error.message 
    });
  }
});

app.get('/api/recommendations', async (req, res) => {
  try {
    console.log('🎯 === RECOMMANDATIONS ===');
    const { userId, limit = 3 } = req.query;
    
    let recommendations;
    
    if (userId && mongoose.connection.readyState === 1) {
      recommendations = await recommendationService.getPersonalizedRecommendations(
        userId, 
        parseInt(limit)
      );
    } else {
      recommendations = await recommendationService.getPopularCourses(parseInt(limit));
    }
    
    console.log(`✅ ${recommendations.length} recommandations générées`);
    
    res.json({
      recommendations: recommendations,
      personalized: !!userId,
      total: recommendations.length
    });
    
  } catch (error) {
    console.error('❌ Erreur recommandations:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération des recommandations',
      message: error.message 
    });
  }
});

// Route de santé pour tester les nouvelles fonctionnalités
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    service: 'ChatBot API',
    features: {
      conversations: true,
      messages: true,
      ai_responses: true,
      course_search: true,
      recommendations: true
    },
    version: '2.0.0'
  });
});

// Route OPTIONS pour CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,X-User-ID');
  res.sendStatus(200);
});

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../chatbot')));

// Route catch-all pour le frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'Route API non trouvée',
      availableRoutes: [
        'GET /api',
        'POST /api/users/register',
        'GET /api/users/:uid',
        'POST /api/users/login',
        'POST /api/guest-response',
        'GET /api/conversations',
        'POST /api/conversations',
        'DELETE /api/conversations/:id',
        'GET /api/conversations/:id/messages',
        'GET /api/courses/search',
        'GET /api/courses/category/:category',
        'GET /api/recommendations',
        'GET /api/health'
      ]
    });
  }
  
  // Sinon, servir le frontend
  res.sendFile(path.join(__dirname, '../chatbot/Ai-connexion.html'));
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur globale:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: error.message
  });
});

// 🚀 Démarrage du serveur
const startServer = async () => {
  try {
    // Tenter de se connecter à MongoDB
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🎉 ================================');
      console.log('🚀 SERVEUR BACKEND DÉMARRÉ !');
      console.log('================================');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🌐 CORS: Activé (toutes origines)`);
      console.log(`🗃️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Mode dégradé'}`);
      console.log('================================\n');
      
      console.log('📋 Routes disponibles:');
      console.log('  GET  / (page d\'accueil)');
      console.log('  GET  /api (test API)');
      console.log('  POST /api/users/register');
      console.log('  GET  /api/users/:uid');
      console.log('  POST /api/users/login');
      console.log('  POST /api/guest-response');
      console.log('  GET  /api/conversations');
      console.log('  POST /api/conversations');
      console.log('  DELETE /api/conversations/:id');
      console.log('  GET  /api/conversations/:id/messages');
      console.log('  GET  /api/courses/search');
      console.log('  GET  /api/courses/category/:category');
      console.log('  GET  /api/recommendations');
      console.log('  GET  /api/health');
      console.log('\n🔧 Prêt à recevoir les requêtes !');
      console.log('💾 Sauvegarde des conversations: Activée');
      console.log('🤖 IA avec persistance: Activée');
    });
  } catch (error) {
    console.error('❌ Erreur critique au démarrage:', error);
    process.exit(1);
  }
};

console.log('✅ Routes IA et conversations ajoutées au serveur');

startServer();