const { Conversation, Message } = require('../models');

// Créer une nouvelle conversation
exports.createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    
    const conversation = await Conversation.create({
      title: title || 'Nouvelle conversation',
      userId: req.user.id
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la conversation', error: error.message });
  }
};

// Obtenir toutes les conversations d'un utilisateur
exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      order: [['lastUpdated', 'DESC']]
    });
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error: error.message });
  }
};

// Obtenir une conversation spécifique avec ses messages
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Message,
          order: [['timestamp', 'ASC']]
        }
      ]
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', error: error.message });
  }
};

// Supprimer une conversation
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    await conversation.destroy();
    
    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la conversation', error: error.message });
  }
};