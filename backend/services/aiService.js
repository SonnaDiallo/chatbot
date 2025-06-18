// services/aiService.js
const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateResponse(userMessage, conversationHistory = [], userProfile = null) {
    try {
      const systemPrompt = this.buildSystemPrompt(userProfile);
      const messages = this.buildMessageHistory(systemPrompt, conversationHistory, userMessage);

      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "gpt-3.5-turbo", // Plus rapide et moins cher que GPT-4
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Erreur API OpenAI:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.',
        details: error.message
      };
    }
  }

  buildSystemPrompt(userProfile) {
    const basePrompt = `Tu es FormationBot, un conseiller en orientation spécialisé dans l'e-learning, sympa et naturel. 

IMPORTANT - Gestion des salutations :
- Si l'utilisateur dit juste "salut", "cc", "coucou", "hey", "bonjour" (sans autre contenu), réponds de manière décontractée
- Puis propose naturellement de parler de ses projets de formation
- Adapte ton ton : plus cool avec les jeunes, plus professionnel si nécessaire

Ton rôle est d'aider les utilisateurs à :
- Analyser leurs besoins et objectifs professionnels
- Évaluer leurs compétences actuelles  
- Recommander des modules de formation adaptés
- Créer des parcours d'apprentissage personnalisés
- Motiver et accompagner leur progression

Caractéristiques de tes réponses :
- Ton naturel et bienveillant (pas trop formel)
- Constructives et encourageantes  
- Basées sur des données concrètes
- Incluant des recommandations d'actions spécifiques
- Adaptées au niveau et aux préférences de chaque utilisateur
- Emojis occasionnels pour rendre ça plus sympa

Modules de formation disponibles :
- Développement Web (Frontend, Backend, Full-Stack)
- Data Science & IA (Python, Machine Learning, Deep Learning)
- Marketing Digital (SEO, Réseaux sociaux, Analytics)
- Gestion de Projet (Agile, Scrum, Management)
- Design UX/UI (Figma, Adobe Suite, Prototypage)
- Cybersécurité (Ethical Hacking, Sécurité réseau)
- Entrepreneuriat (Business Plan, Finance, Leadership)
- Langues (Anglais professionnel, Communication)

Réponds toujours en français et sois concis mais informatif.`;

    if (userProfile) {
      return `${basePrompt}

Profil de l'utilisateur actuel :
- Nom: ${userProfile.firstname} ${userProfile.lastname}
- Inscrit le: ${new Date(userProfile.registrationDate).toLocaleDateString('fr-FR')}
- Âge approximatif: ${this.calculateAge(userProfile.birthdate)} ans

Adapte ton ton selon l'âge : plus décontracté avec les jeunes (18-25 ans), plus pro avec les seniors.`;
    }

    return basePrompt;
  }

//   buildSystemPrompt(userProfile) {
//     const basePrompt = `Tu es un conseiller en orientation spécialisé dans l'e-learning intelligent et personnalisé. 

// Ton rôle est d'aider les utilisateurs à :
// - Analyser leurs besoins et objectifs professionnels
// - Évaluer leurs compétences actuelles  
// - Recommander des modules de formation adaptés
// - Créer des parcours d'apprentissage personnalisés
// - Motiver et accompagner leur progression

// Caractéristiques de tes réponses :
// - Personnalisées et empathiques
// - Constructives et encourageantes  
// - Basées sur des données concrètes
// - Incluant des recommandations d'actions spécifiques
// - Adaptées au niveau et aux préférences de chaque utilisateur

// Modules de formation disponibles :
// - Développement Web (Frontend, Backend, Full-Stack)
// - Data Science & IA (Python, Machine Learning, Deep Learning)
// - Marketing Digital (SEO, Réseaux sociaux, Analytics)
// - Gestion de Projet (Agile, Scrum, Management)
// - Design UX/UI (Figma, Adobe Suite, Prototypage)
// - Cybersécurité (Ethical Hacking, Sécurité réseau)
// - Entrepreneuriat (Business Plan, Finance, Leadership)
// - Langues (Anglais professionnel, Communication)

// Réponds toujours en français et sois concis mais informatif.`;

//     if (userProfile) {
//       return `${basePrompt}

// Profil de l'utilisateur actuel :
// - Nom: ${userProfile.firstname} ${userProfile.lastname}
// - Inscrit le: ${new Date(userProfile.registrationDate).toLocaleDateString('fr-FR')}
// - Âge approximatif: ${this.calculateAge(userProfile.birthdate)} ans

// Adapte tes conseils en fonction de ce profil utilisateur.`;
//     }

//     return basePrompt;
//   }

  buildMessageHistory(systemPrompt, history, currentMessage) {
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Ajouter l'historique (limité aux 15 derniers messages)
    const recentHistory = history.slice(-15);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  analyzeUserIntent(message) {
    const intents = {
      course_recommendation: /cours|formation|module|apprendre|étudier|recommand/i,
      career_guidance: /carrière|métier|profession|travail|emploi|orientation/i,
      skill_assessment: /compétence|niveau|évaluation|test|capacité/i,
      schedule_help: /planning|horaire|temps|organisation/i,
      motivation: /motiv|encouragement|aide|soutien|difficile/i,
      technical_question: /comment|pourquoi|technique|expliquer/i,
      greeting: /bonjour|salut|hello|bonsoir|hey/i,
      thanks: /merci|remercie|gratitude/i
    };

    const detectedIntents = [];
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        detectedIntents.push(intent);
      }
    }

    return detectedIntents.length > 0 ? detectedIntents : ['general'];
  }

  calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = new AIService();