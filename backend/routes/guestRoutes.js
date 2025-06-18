// // routes/guestRoutes.js - Version mise à jour avec sauvegarde MongoDB
// const express = require('express');
// const router = express.Router();
// const aiService = require('../services/aiService');

// // Import des modèles MongoDB
// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const mongoose = require('mongoose');

// router.post('/guest-response', async (req, res) => {
//   try {
//     console.log('🤖 === REQUÊTE IA ===');
//     console.log('Message reçu:', req.body.message);
    
//     const { message, conversationHistory = [], conversationId } = req.body;
    
//     if (!message || !message.trim()) {
//       return res.status(400).json({ 
//         error: 'Message requis',
//         message: 'Veuillez fournir un message à traiter'
//       });
//     }

//     // Récupérer l'utilisateur si connecté
//     let userId = null;
//     let userProfile = null;
    
//     // Récupérer userId depuis les headers
//     if (req.headers['x-user-id']) {
//       userId = req.headers['x-user-id'];
//       console.log('🔐 UserId détecté:', userId);
//     }

//     // 1. GÉRER LA CONVERSATION MONGODB
//     let currentConversationId = conversationId;
    
//     if (mongoose.connection.readyState === 1) {
//       try {
//         // Si pas de conversationId et utilisateur connecté, créer une nouvelle conversation
//         if (!currentConversationId && userId) {
//           const newConversation = new Conversation({
//             userId: userId,
//             title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
//           });
//           const savedConversation = await newConversation.save();
//           currentConversationId = savedConversation._id;
//           console.log('📝 Nouvelle conversation créée:', currentConversationId);
//         }

//         // Sauvegarder le message utilisateur
//         if (currentConversationId) {
//           const userMessage = new Message({
//             text: message.trim(),
//             sender: 'user',
//             conversationId: currentConversationId,
//             timestamp: new Date()
//           });
//           await userMessage.save();
//           console.log('💬 Message utilisateur sauvegardé');
//         }
//       } catch (dbError) {
//         console.error('⚠️ Erreur sauvegarde utilisateur:', dbError.message);
//         // Continuer même si la sauvegarde échoue
//       }
//     }

//     console.log('🧠 Envoi vers OpenAI...');
    
//     // 2. APPEL AU SERVICE IA
//     const aiResult = await aiService.generateResponse(
//       message.trim(), 
//       conversationHistory, 
//       userProfile
//     );
    
//     if (aiResult.success) {
//       console.log('✅ Réponse IA générée avec succès');
//       console.log('📊 Tokens utilisés:', aiResult.usage?.total_tokens || 'N/A');
      
//       // 3. SAUVEGARDER LA RÉPONSE IA
//       if (mongoose.connection.readyState === 1 && currentConversationId) {
//         try {
//           const botMessage = new Message({
//             text: aiResult.response,
//             sender: 'bot',
//             conversationId: currentConversationId,
//             timestamp: new Date(),
//             metadata: {
//               tokensUsed: aiResult.usage?.total_tokens,
//               model: 'gpt-3.5-turbo'
//             }
//           });
//           await botMessage.save();
//           console.log('🤖 Réponse IA sauvegardée');

//           // Mettre à jour la conversation
//           await Conversation.findByIdAndUpdate(currentConversationId, {
//             lastUpdated: new Date()
//           });
//           console.log('📅 Conversation mise à jour');
//         } catch (dbError) {
//           console.error('⚠️ Erreur sauvegarde IA:', dbError.message);
//           // Continuer même si la sauvegarde échoue
//         }
//       }
      
//       // 4. RÉPONSE AU CLIENT
//       res.json({ 
//         text: aiResult.response,
//         conversationId: currentConversationId,
//         usage: aiResult.usage,
//         timestamp: new Date().toISOString(),
//         success: true
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
//       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// });

// module.exports = router;




// routes/guestRoutes.js - Version améliorée avec gestion complète des conversations
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// Import des modèles MongoDB
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// Middleware pour logger les requêtes
router.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Route principale pour les réponses IA avec sauvegarde complète
router.post('/guest-response', async (req, res) => {
    try {
        console.log('🤖 === NOUVELLE REQUÊTE IA ===');
        console.log('📝 Message reçu:', req.body.message);
        console.log('🔗 Conversation ID:', req.body.conversationId);
        
        const { message, conversationHistory = [], conversationId } = req.body;
        
        // Validation du message
        if (!message || !message.trim()) {
            return res.status(400).json({ 
                error: 'Message requis',
                message: 'Veuillez fournir un message à traiter',
                success: false
            });
        }

        // Récupérer l'utilisateur si connecté
        let userId = null;
        let userProfile = null;
        
        // Méthodes multiples pour récupérer l'userId
        if (req.headers['x-user-id']) {
            userId = req.headers['x-user-id'];
            console.log('🔐 UserId depuis header:', userId);
        } else if (req.user && req.user._id) {
            userId = req.user._id;
            console.log('🔐 UserId depuis auth middleware:', userId);
        } else if (req.body.userId) {
            userId = req.body.userId;
            console.log('🔐 UserId depuis body:', userId);
        }

        // 1. GÉRER LA CONVERSATION MONGODB
        let currentConversationId = conversationId;
        let conversationCreated = false;
        
        if (mongoose.connection.readyState === 1) {
            try {
                // Si pas de conversationId et utilisateur connecté, créer une nouvelle conversation
                if (!currentConversationId && userId) {
                    console.log('🆕 Création d\'une nouvelle conversation...');
                    
                    // Générer un titre intelligent basé sur le message
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
                    console.log('📋 Titre:', title);
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
                // Continuer même si la sauvegarde échoue
            }
        } else {
            console.log('⚠️ MongoDB non connecté - mode dégradé');
        }

        console.log('🧠 Envoi vers le service IA...');
        
        // 2. PRÉPARER LE CONTEXTE POUR L'IA
        let enhancedHistory = conversationHistory;
        
        // Si on a une conversation ID, récupérer l'historique depuis la DB
        if (currentConversationId && mongoose.connection.readyState === 1) {
            try {
                const recentMessages = await Message.find({
                    conversationId: currentConversationId
                })
                .sort({ timestamp: -1 })
                .limit(20)
                .select('text sender timestamp');
                
                enhancedHistory = recentMessages.reverse().map(msg => ({
                    text: msg.text,
                    sender: msg.sender,
                    timestamp: msg.timestamp
                }));
                
                console.log('📚 Historique chargé depuis DB:', enhancedHistory.length, 'messages');
            } catch (dbError) {
                console.error('⚠️ Erreur chargement historique:', dbError.message);
                // Utiliser l'historique fourni en fallback
            }
        }

        // 3. APPEL AU SERVICE IA
        const aiResult = await aiService.generateResponse(
            message.trim(), 
            enhancedHistory, 
            userProfile
        );
        
        if (aiResult.success) {
            console.log('✅ Réponse IA générée avec succès');
            console.log('📊 Tokens utilisés:', aiResult.usage?.total_tokens || 'N/A');
            console.log('🤖 Longueur réponse:', aiResult.response.length, 'caractères');
            
            // 4. SAUVEGARDER LA RÉPONSE IA
            if (mongoose.connection.readyState === 1 && currentConversationId) {
                try {
                    const botMessage = new Message({
                        text: aiResult.response,
                        sender: 'bot',
                        conversationId: currentConversationId,
                        timestamp: new Date(),
                        metadata: {
                            tokensUsed: aiResult.usage?.total_tokens,
                            model: aiResult.model || 'gpt-3.5-turbo',
                            processingTime: aiResult.processingTime,
                            confidence: aiResult.confidence
                        }
                    });
                    
                    await botMessage.save();
                    console.log('🤖 Réponse IA sauvegardée');

                    // Mettre à jour la conversation
                    await Conversation.findByIdAndUpdate(currentConversationId, {
                        lastUpdated: new Date()
                    });
                    console.log('📅 Conversation mise à jour');
                    
                } catch (dbError) {
                    console.error('⚠️ Erreur sauvegarde réponse IA:', dbError.message);
                    // Continuer même si la sauvegarde échoue
                }
            }
            
            // 5. RÉPONSE AU CLIENT
            const response = { 
                text: aiResult.response,
                conversationId: currentConversationId,
                conversationCreated: conversationCreated,
                usage: aiResult.usage,
                timestamp: new Date().toISOString(),
                success: true
            };
            
            // Ajouter des métadonnées pour le debug en développement
            if (process.env.NODE_ENV === 'development') {
                response.debug = {
                    userId: userId,
                    historyLength: enhancedHistory.length,
                    dbConnected: mongoose.connection.readyState === 1,
                    processingTime: aiResult.processingTime
                };
            }
            
            res.json(response);
            console.log('📤 Réponse envoyée avec succès');
            
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
        console.error('❌ ERREUR CRITIQUE dans guest-response:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: error.message,
            success: false,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route pour récupérer les conversations d'un utilisateur (guest friendly)
router.get('/conversations', async (req, res) => {
    try {
        let userId = req.headers['x-user-id'] || (req.user && req.user._id);
        
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
router.get('/conversations/:conversationId/messages', async (req, res) => {
    try {
        const { conversationId } = req.params;
        let userId = req.headers['x-user-id'] || (req.user && req.user._id);
        
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
router.delete('/conversations/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        let userId = req.headers['x-user-id'] || (req.user && req.user._id);
        
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

        console.log('🗑️ Conversation supprimée:', conversationId);

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

// Route pour mettre à jour le titre d'une conversation
router.patch('/conversations/:conversationId/title', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;
        let userId = req.headers['x-user-id'] || (req.user && req.user._id);
        
        if (!userId || !title || !title.trim()) {
            return res.status(400).json({ 
                error: 'Paramètres manquants',
                success: false
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                error: 'Base de données non disponible',
                success: false
            });
        }

        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversationId, userId },
            { 
                title: title.trim().substring(0, 100), // Limiter la longueur
                lastUpdated: new Date() 
            },
            { new: true }
        );

        if (!conversation) {
            return res.status(404).json({ 
                error: 'Conversation non trouvée',
                success: false
            });
        }

        res.json({ 
            conversation,
            success: true
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour titre:', error);
        res.status(500).json({ 
            error: 'Erreur serveur',
            success: false
        });
    }
});

// Fonction utilitaire pour générer un titre de conversation intelligent
function generateConversationTitle(message) {
    // Nettoyer le message
    const cleanMessage = message.trim().toLowerCase();
    
    // Mots-clés pour générer des titres intelligents
    const keywords = {
        'développement': 'Apprentissage Développement',
        'développeur': 'Devenir Développeur',
        'web': 'Développement Web',
        'javascript': 'Formation JavaScript',
        'react': 'Formation React',
        'python': 'Formation Python',
        'java': 'Formation Java',
        'cybersécurité': 'Formation Cybersécurité',
        'sécurité': 'Sécurité Informatique',
        'design': 'Formation Design',
        'ux': 'Design UX/UI',
        'ui': 'Interface Utilisateur',
        'data': 'Science des Données',
        'intelligence artificielle': 'Formation IA',
        'machine learning': 'Machine Learning',
        'base de données': 'Bases de Données',
        'réseau': 'Réseaux Informatiques',
        'mobile': 'Développement Mobile',
        'android': 'Développement Android',
        'ios': 'Développement iOS',
        'formation': 'Recherche Formation',
        'cours': 'Recherche Cours',
        'apprendre': 'Apprentissage',
        'étudier': 'Études'
    };
    
    // Chercher des mots-clés correspondants
    for (const [keyword, title] of Object.entries(keywords)) {
        if (cleanMessage.includes(keyword)) {
            return title;
        }
    }
    
    // Si aucun mot-clé trouvé, utiliser le début du message
    const truncated = message.substring(0, 50);
    return truncated.length < message.length ? truncated + '...' : truncated;
}

// Route de test pour vérifier la santé du service
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        service: 'Guest Routes',
        version: '2.0.0'
    });
});

module.exports = router;