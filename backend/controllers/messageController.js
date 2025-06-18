// controllers/messageController.js
const { Conversation, Message } = require('../models');
const aiService = require('../services/aiService');

// Ajouter un message à une conversation avec réponse IA
exports.addMessage = async (req, res) => {
  try {
    const { text, sender } = req.body;
    
    if (!text || !sender) {
      return res.status(400).json({ message: 'Le texte et l\'expéditeur sont requis' });
    }
    
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Sauvegarder le message de l'utilisateur
    const userMessage = await Message.create({
      text,
      sender,
      conversationId: conversation._id
    });

    // Si c'est un message utilisateur, générer une réponse IA
    let aiResponse = null;
    if (sender === 'user') {
      // Récupérer l'historique de conversation
      const messageHistory = await Message.find({ 
        conversationId: conversation._id 
      })
      .sort({ timestamp: 1 })
      .limit(20)
      .lean();

      // Générer la réponse IA
      const aiResult = await aiService.generateResponse(
        text, 
        messageHistory, 
        req.user
      );

      if (aiResult.success) {
        // Sauvegarder la réponse de l'IA
        aiResponse = await Message.create({
          text: aiResult.response,
          sender: 'bot',
          conversationId: conversation._id,
          metadata: {
            usage: aiResult.usage,
            intents: aiService.analyzeUserIntent(text)
          }
        });
      } else {
        // En cas d'erreur, créer un message d'erreur générique
        aiResponse = await Message.create({
          text: aiResult.error,
          sender: 'bot',
          conversationId: conversation._id,
          metadata: { error: true }
        });
      }
    }
    
    // Mettre à jour la date de dernière modification de la conversation
    conversation.lastUpdated = new Date();
    await conversation.save();
    
    // Retourner les messages
    const response = {
      userMessage,
      aiMessage: aiResponse
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout du message', 
      error: error.message 
    });
  }
};

// Obtenir tous les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    const messages = await Message.find({ 
      conversationId: conversation._id 
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des messages', 
      error: error.message 
    });
  }
};

// Régénérer une réponse IA
exports.regenerateAIResponse = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage || originalMessage.sender !== 'user') {
      return res.status(404).json({ message: 'Message utilisateur non trouvé' });
    }

    const conversation = await Conversation.findOne({
      _id: originalMessage.conversationId,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const messageHistory = await Message.find({ 
      conversationId: conversation._id,
      timestamp: { $lt: originalMessage.timestamp }
    })
    .sort({ timestamp: 1 })
    .limit(20)
    .lean();

    const aiResult = await aiService.generateResponse(
      originalMessage.text,
      messageHistory,
      req.user
    );

    if (aiResult.success) {
      const newAiResponse = await Message.create({
        text: aiResult.response,
        sender: 'bot',
        conversationId: conversation._id,
        metadata: {
          usage: aiResult.usage,
          regenerated: true,
          originalMessageId: messageId
        }
      });

      res.json(newAiResponse);
    } else {
      res.status(500).json({ message: 'Erreur lors de la régénération', error: aiResult.error });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la régénération', 
      error: error.message 
    });
  }
};