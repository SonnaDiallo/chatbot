# 🤖 ChatBot IA pour l'Orientation en E-Learning

Un assistant intelligent développé pour aider les utilisateurs à trouver des formations et cours adaptés à leurs besoins en informatique et technologies.

**Status:** Active | **Version:** 2.0.0 | **License:** MIT

## ✨ Fonctionnalités Principales

- 🤖 **Intelligence Artificielle** : Intégration OpenAI GPT pour des réponses contextuelles
- 💾 **Sauvegarde Automatique** : Toutes les conversations sont persistées en base MongoDB
- 📚 **Historique Complet** : Accès à toutes vos discussions précédentes
- 🔐 **Authentification Sécurisée** : Système d'auth Firebase intégré
- 📖 **Recommandations Personnalisées** : Suggestions de cours basées sur vos objectifs
- 📱 **Interface Responsive** : Compatible mobile, tablette et desktop
- ⚡ **Temps Réel** : Réponses instantanées avec indicateurs de frappe
- 🎯 **Questions Rapides** : Accès direct aux sujets populaires

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** & **Express.js** - Serveur web moderne
- **MongoDB** - Base de données NoSQL pour la persistance
- **OpenAI API** - Intelligence artificielle GPT-3.5/4
- **Firebase Admin** - Authentification et autorisation

### Frontend
- **HTML5/CSS3** - Interface utilisateur moderne
- **JavaScript ES6+** - Logique client interactive
- **Fetch API** - Communications asynchrones
- **LocalStorage** - Cache local pour l'UX

### DevOps & Sécurité
- **CORS** configuré pour la sécurité
- **Variables d'environnement** pour les secrets
- **Middleware d'authentification** custom
- **Validation des données** côté serveur

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** 16+ 
- **MongoDB** (local ou Atlas)
- **Compte OpenAI** avec clé API
- **Projet Firebase** configuré

### 1. Cloner le projet
```bash
git clone https://github.com/SonnaDiallo/chatbot.git
cd chatbot
```

### 2. Installation Backend
```bash
cd backend
npm install
```

### 3. Configuration des variables d'environnement
Créez un fichier `.env` dans le dossier `backend/` :
```env
# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/chatbot
# ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv:mongodb+srv://chatbot-app:Y%40smine27@cluster0.piqhjvv.mongodb.net/chatbot?retryWrites=true&w=majority&appName=Cluster0

OPENAI_API_KEY=sk-ma_clé_openai_

# Serveur Configuration
PORT=5000
NODE_ENV=development

# Firebase (optionnel pour l'admin)
FIREBASE_PROJECT_ID=chatbot-web
```

### 4. Configuration Firebase
Placement du fichier `firebaseServiceAccount.json` dans `backend/config/`

### 5. Lancer l'application
```bash
# Depuis le dossier backend/
node server.js

# Ou en mode développement
npm run dev
```

### 6. Accéder à l'application
- **Frontend** : `http://127.0.0.1:5504/chatbot/Ai-connexion.html` (serveur sert les fichiers statiques)
- **API** : `http://localhost:5000/api`
- **Page de connexion** : `http://127.0.0.1:5504/chatbot/login.html`
- **Page d'inscription** : `http://127.0.0.1:5504/chatbot/register.html`

## 📁 Structure du Projet

```
chatbot/
├── 📁 backend/                    # Backend Node.js
│   ├── 📁 config/                # Configuration
│   │   ├── 🔧 database.js        # Configuration MongoDB
│   │   └── 🔑 firebaseServiceAccount.json
│   ├── 📁 controllers/           # Logique métier
│   │   ├── 📋 conversationController.js
│   │   ├── 📚 courseController.js
│   │   ├── 💬 messageController.js
│   │   └── 👤 userController.js
│   ├── 📁 middleware/            # Middleware Express
│   │   └── 🔐 authMiddleware.js  # Authentification
│   ├── 📁 models/                # Modèles MongoDB
│   │   ├── 📋 Conversation.js    # Schéma conversations
│   │   ├── 📚 course.js          # Schéma cours
│   │   ├── 📝 index.js           # Export des modèles
│   │   ├── 💬 Message.js         # Schéma messages
│   │   ├── 👤 User.js            # Schéma utilisateurs
│   │   └── 👤 UserProfile.js     # Profils utilisateurs
│   ├── 📁 routes/                # Routes API
│   │   ├── 📋 conversationRoutes.js
│   │   ├── 📚 courseRoutes.js
│   │   ├── 👥 guestRoutes.js     # Routes publiques
│   │   ├── 👤 profileRoutes.js
│   │   └── 👤 userRoutes.js
│   ├── 📁 services/              # Services métier
│   │   ├── 🤖 aiService.js       # Intégration OpenAI
│   │   └── 🎯 recommendationService.js
│   ├── 🌐 server.js              # Point d'entrée serveur
│   ├── ⚙️ package.json           # Dépendances backend
│   └── 🔒 .env                   # Variables d'environnement
├── 📁 chatbot/                   # Frontend
│   ├── 📁 images/                # Assets visuels
│   │   ├── 🖼️ ai-logo2.png       # Logo du chatbot
│   │   ├── 🖼️ arrière-plan3.webp # Background
│   │   ├── 🖼️ arrière-plan.jpg   # Background alternatif
│   │   └── 🖼️ arrière-plan2.jpg  # Background mobile
│   ├── 🎨 Ai-connexion.css       # Styles principaux
│   ├── 🌐 Ai-connexion.html      # Interface chat
│   ├── ⚡ firebase.js            # Config Firebase
│   ├── 🎨 index.css              # Styles globaux
│   ├── 🌐 index.html             # Page d'accueil
│   ├── 🎨 login.css              # Styles connexion
│   ├── 🔐 login.html             # Page de connexion
│   ├── 🎨 register.css           # Styles inscription
│   └── 📝 register.html          # Page d'inscription
├── 📄 README.md                  # Documentation
├── ⚙️ package.json               # Dépendances principales
└── 🔒 .gitignore                 # Fichiers ignorés par Git
```

## 🎯 Utilisation

### Pour les Utilisateurs
1. **Connexion** : Connectez-vous avec Firebase Auth
2. **Question** : Posez votre question sur les formations
3. **Réponse IA** : Obtenez des recommandations personnalisées
4. **Historique** : Retrouvez vos discussions via "Mes Discussions"
5. **Navigation** : Changez de conversation ou créez-en une nouvelle

### Pour les Développeurs
```javascript
// Exemple d'appel API pour les conversations
fetch('/api/conversations', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-User-ID': userId
  }
})
```

## 🔧 API Endpoints

### 👤 Authentification (`/api/users`)
- `POST /api/users/register` - Inscription d'un nouvel utilisateur
- `POST /api/users/login` - Connexion utilisateur
- `GET /api/users/:uid` - Récupérer le profil utilisateur

### 📋 Conversations (`/api/conversations`)
- `GET /api/conversations` - Liste des conversations utilisateur
- `POST /api/conversations` - Créer une nouvelle conversation
- `GET /api/conversations/:id` - Détails d'une conversation
- `DELETE /api/conversations/:id` - Supprimer une conversation
- `GET /api/conversations/:id/messages` - Messages d'une conversation
- `POST /api/conversations/:id/messages` - Ajouter un message

### 🤖 Intelligence Artificielle (`/api`)
- `POST /api/guest-response` - Réponse IA (utilisateurs connectés et invités)

### 📚 Cours et Formations (`/api/courses`)
- `GET /api/courses/search` - Recherche de cours par mots-clés
- `GET /api/courses/category/:category` - Cours par catégorie
- `GET /api/recommendations` - Recommandations personnalisées

### 👥 Routes Publiques (`/api`)
- `GET /api/health` - Statut de santé du serveur

## 🎨 Interface Utilisateur

### Chat Principal
- Interface moderne et intuitive avec FormationBot
- Design responsive pour tous les appareils
- Animations fluides et indicateurs de frappe en temps réel

### Gestion des Conversations
- Dropdown "Mes Discussions" pour naviguer rapidement
- Historique complet de toutes vos conversations
- Possibilité de supprimer les anciennes discussions
- Création automatique de nouvelles conversations

## 🚀 Déploiement

### Heroku
```bash
# Installer Heroku CLI puis :
heroku create votre-app-chatbot
heroku config:set MONGODB_URI=your_mongo_url
heroku config:set OPENAI_API_KEY=your_openai_key
git push heroku main
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm test

# Test de l'API
curl http://localhost:5000/api/health
```

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. **Fork** le projet
2. **Créez** votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Committez** vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrez** une Pull Request

### Standards de Code
- Code en français pour les commentaires
- ESLint pour le JavaScript
- Commits descriptifs
- Documentation des nouvelles fonctionnalités

## 🐛 Problèmes Connus

- [ ] Améliorer la gestion d'erreur réseau
- [ ] Ajouter des tests unitaires
- [ ] Optimiser les performances MongoDB
- [ ] Support multilingue

## 📈 Roadmap

### Version 2.1
- [ ] Système de notation des réponses
- [ ] Export des conversations en PDF
- [ ] Notifications push
- [ ] Mode sombre

### Version 3.0
- [ ] Support vocal (Speech-to-Text)
- [ ] Intégration vidéo des cours
- [ ] Tableau de bord analytics
- [ ] API publique pour intégrations

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Sonna Diallo**
- GitHub: [@SonnaDiallo](https://github.com/SonnaDiallo)
- Projet: [ChatBot Formation IA](https://github.com/SonnaDiallo/chatbot)

## 🙏 Remerciements

- **OpenAI** pour l'API GPT exceptionnelle
- **MongoDB** pour la base de données robuste
- **Firebase** pour l'authentification simple
- **La communauté open source** pour l'inspiration

---

⭐ **Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile !** ⭐