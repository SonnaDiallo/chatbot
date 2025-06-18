// scripts/initDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/course');

dotenv.config();

const sampleCourses = [
  // Développement Web
  {
    title: "Développement Web Complet - HTML, CSS, JavaScript",
    description: "Apprenez les fondamentaux du développement web avec HTML5, CSS3 et JavaScript moderne. Créez des sites web interactifs et responsives.",
    category: "Développement Web",
    subcategory: "Frontend",
    level: "débutant",
    duration: 40,
    price: 0,
    rating: 4.8,
    enrolledCount: 1250,
    skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    prerequisites: ["Bases informatiques"],
    learningObjectives: [
      "Maîtriser HTML5 et la structure d'une page web",
      "Styliser avec CSS3 et les flexbox/grid",
      "Programmer en JavaScript ES6+",
      "Créer des sites web responsives"
    ],
    modules: [
      {
        title: "Introduction au HTML",
        description: "Structure d'une page web, balises essentielles",
        duration: 8,
        difficulty: "débutant",
        skills: ["HTML"],
        content: [
          {
            chapter: "Bases HTML",
            topics: ["Structure document", "Balises sémantiques", "Formulaires"]
          }
        ]
      },
      {
        title: "Stylisation avec CSS",
        description: "Mise en forme, layout et responsive design",
        duration: 12,
        difficulty: "débutant",
        skills: ["CSS"],
        content: [
          {
            chapter: "CSS Fondamentaux",
            topics: ["Sélecteurs", "Box model", "Flexbox", "Grid"]
          }
        ]
      },
      {
        title: "JavaScript Interactif",
        description: "Manipulation DOM et événements",
        duration: 20,
        difficulty: "intermédiaire",
        skills: ["JavaScript"],
        content: [
          {
            chapter: "JavaScript ES6+",
            topics: ["Variables", "Fonctions", "DOM", "Events", "APIs"]
          }
        ]
      }
    ],
    tags: ["cybersécurité", "ethical-hacking", "audit", "protection"],
    certification: true
  },

  // Autres cours (corrigés pour syntaxe)
  {
    title: "React.js - Développement d'Applications Modernes",
    description: "Maîtrisez React.js pour créer des applications web interactives et performantes. Hooks, Context API, et bonnes pratiques.",
    category: "Développement Web",
    subcategory: "Frontend Framework",
    level: "intermédiaire",
    duration: 35,
    price: 79,
    rating: 4.9,
    enrolledCount: 890,
    skills: ["React", "JSX", "Hooks", "State Management"],
    prerequisites: ["JavaScript ES6", "HTML", "CSS"],
    learningObjectives: [
      "Créer des composants React réutilisables",
      "Gérer l'état avec les Hooks",
      "Intégrer des APIs externes",
      "Déployer une application React"
    ],
    modules: [
      {
        title: "Fondamentaux React",
        duration: 12,
        difficulty: "intermédiaire",
        skills: ["React", "JSX"]
      },
      {
        title: "Hooks et State Management",
        duration: 15,
        difficulty: "intermédiaire",
        skills: ["React Hooks", "Context API"]
      },
      {
        title: "Projet Final",
        duration: 8,
        difficulty: "avancé",
        skills: ["React", "APIs", "Deployment"]
      }
    ],
    tags: ["react", "frontend", "spa", "moderne"],
    certification: true
  }
  // Tu peux ajouter ici les autres cours si besoin
];

// Fonction d'initialisation
async function initializeDatabase() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log(`${existingCourses} cours déjà présents dans la base`);
      console.log('Voulez-vous les supprimer et réinitialiser ? (y/N)');

      const shouldReset = process.argv.includes('--reset');
      if (shouldReset) {
        await Course.deleteMany({});
        console.log('🗑️ Anciens cours supprimés');
      } else {
        console.log('ℹ️ Conservation des cours existants');
        process.exit(0);
      }
    }

    console.log('📚 Insertion des cours...');
    const insertedCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ ${insertedCourses.length} cours ajoutés avec succès !`);

    await Course.createIndexes();
    console.log('📋 Index de recherche créés');

    const stats = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalEnrolled: { $sum: '$enrolledCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Statistiques par catégorie :');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} cours, note moyenne: ${stat.avgRating.toFixed(1)}, ${stat.totalEnrolled} inscrits`);
    });

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\nCours disponibles :');
    const allCourses = await Course.find({}).select('title category level duration rating');
    allCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title} (${course.category}, ${course.level}, ${course.duration}h, ⭐${course.rating})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, sampleCourses };
