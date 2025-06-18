// services/recommendationService.js
const Course = require('../models/course');
const UserProfile = require('../models/UserProfile');

class RecommendationService {
  
  // Recommandations basées sur le profil utilisateur
  async getPersonalizedRecommendations(userId, limit = 5) {
    try {
      const userProfile = await UserProfile.findOne({ userId }).populate('enrollments.courseId');
      
      if (!userProfile) {
        return await this.getPopularCourses(limit);
      }

      // Analyser les préférences utilisateur
      const preferences = this.analyzeUserPreferences(userProfile);
      
      // Construire la requête de recommandation
      const query = this.buildRecommendationQuery(preferences, userProfile);
      
      // Récupérer les cours recommandés
      let recommendations = await Course.find(query)
        .limit(limit * 2) // Récupérer plus pour filtrer ensuite
        .sort({ rating: -1, enrolledCount: -1 });

      // Scorer et trier les recommandations
      recommendations = this.scoreRecommendations(recommendations, userProfile);
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la génération de recommandations:', error);
      return await this.getPopularCourses(limit);
    }
  }

  // Analyser les préférences utilisateur
  analyzeUserPreferences(userProfile) {
    const preferences = {
      categories: [],
      skills: [],
      difficulty: userProfile.experience || 'débutant',
      timeAvailable: userProfile.availableTimePerWeek || 5
    };

    // Analyser les formations en cours
    if (userProfile.enrollments.length > 0) {
      const categories = userProfile.enrollments.map(e => e.courseId?.category).filter(Boolean);
      preferences.categories = [...new Set(categories)];
    }

    // Analyser les objectifs d'apprentissage
    if (userProfile.learningGoals.length > 0) {
      preferences.skills = userProfile.learningGoals.map(g => g.goal);
    }

    // Analyser les compétences existantes
    if (userProfile.skills.length > 0) {
      const strongSkills = userProfile.skills
        .filter(s => s.level >= 7)
        .map(s => s.skill);
      preferences.strongSkills = strongSkills;
    }

    return preferences;
  }

  // Construire la requête MongoDB
  buildRecommendationQuery(preferences, userProfile) {
    const query = { isActive: true };

    // Exclure les cours déjà suivis
    const enrolledCourseIds = userProfile.enrollments.map(e => e.courseId);
    const completedCourseIds = userProfile.completedCourses.map(c => c.courseId);
    const excludeIds = [...enrolledCourseIds, ...completedCourseIds];
    
    if (excludeIds.length > 0) {
      query._id = { $nin: excludeIds };
    }

    // Filtrer par catégories d'intérêt
    if (preferences.categories.length > 0) {
      query.category = { $in: preferences.categories };
    }

    // Filtrer par niveau approprié
    const appropriateLevels = this.getAppropriateLevels(preferences.difficulty);
    query.level = { $in: appropriateLevels };

    // Filtrer par durée disponible
    if (preferences.timeAvailable < 10) {
      query.duration = { $lte: 20 }; // Cours courts
    } else if (preferences.timeAvailable > 20) {
      query.duration = { $gte: 15 }; // Cours plus longs OK
    }

    return query;
  }

  // Définir les niveaux appropriés selon l'expérience
  getAppropriateLevels(experience) {
    const levelMap = {
      'débutant': ['débutant'],
      '1-3 ans': ['débutant', 'intermédiaire'],
      '3-5 ans': ['intermédiaire'],
      '5-10 ans': ['intermédiaire', 'avancé'],
      '10+ ans': ['avancé']
    };
    
    return levelMap[experience] || ['débutant', 'intermédiaire'];
  }

  // Scorer les recommandations
  scoreRecommendations(courses, userProfile) {
    return courses.map(course => {
      let score = 0;

      // Score basé sur la popularité
      score += Math.min(course.rating * 10, 50);
      score += Math.min(course.enrolledCount / 100, 20);

      // Score basé sur les compétences utilisateur
      if (userProfile.skills.length > 0) {
        const relevantSkills = course.skills.filter(skill => 
          userProfile.skills.some(userSkill => 
            userSkill.skill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        score += relevantSkills.length * 15;
      }

      // Score basé sur les objectifs
      if (userProfile.learningGoals.length > 0) {
        const relevantGoals = userProfile.learningGoals.filter(goal =>
          course.title.toLowerCase().includes(goal.goal.toLowerCase()) ||
          course.description.toLowerCase().includes(goal.goal.toLowerCase())
        );
        score += relevantGoals.length * 20;
      }

      // Bonus pour certification si objectif professionnel
      if (course.certification && userProfile.careerGoals.length > 0) {
        score += 10;
      }

      return { ...course.toObject(), recommendationScore: score };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  // Cours populaires par défaut
  async getPopularCourses(limit = 5) {
    return await Course.find({ isActive: true })
      .sort({ rating: -1, enrolledCount: -1 })
      .limit(limit);
  }

  // Recommandations basées sur un cours spécifique
  async getSimilarCourses(courseId, limit = 3) {
    const course = await Course.findById(courseId);
    if (!course) return [];

    return await Course.find({
      _id: { $ne: courseId },
      $or: [
        { category: course.category },
        { skills: { $in: course.skills } },
        { tags: { $in: course.tags } }
      ],
      isActive: true
    })
    .sort({ rating: -1 })
    .limit(limit);
  }

  // Recommandations pour un domaine spécifique
  async getCoursesByCategory(category, userLevel = 'débutant', limit = 10) {
    const appropriateLevels = this.getAppropriateLevels(userLevel);
    
    return await Course.find({
      category: category,
      level: { $in: appropriateLevels },
      isActive: true
    })
    .sort({ rating: -1, enrolledCount: -1 })
    .limit(limit);
  }

  // Générer un parcours d'apprentissage
  async generateLearningPath(userId, targetSkill, timeframe = '3 months') {
    const userProfile = await UserProfile.findOne({ userId });
    const currentLevel = this.getUserSkillLevel(userProfile, targetSkill);
    
    // Définir les étapes d'apprentissage
    const steps = this.defineLearningSteps(targetSkill, currentLevel);
    
    // Trouver les cours pour chaque étape
    const path = [];
    for (const step of steps) {
      const courses = await Course.find({
        $or: [
          { skills: { $in: step.skills } },
          { title: { $regex: step.keywords.join('|'), $options: 'i' } }
        ],
        level: step.level,
        isActive: true
      })
      .sort({ rating: -1 })
      .limit(2);

      if (courses.length > 0) {
        path.push({
          step: step.name,
          description: step.description,
          estimatedDuration: step.duration,
          courses: courses
        });
      }
    }

    return path;
  }

  // Obtenir le niveau d'une compétence pour un utilisateur
  getUserSkillLevel(userProfile, skill) {
    if (!userProfile || !userProfile.skills) return 0;
    
    const userSkill = userProfile.skills.find(s => 
      s.skill.toLowerCase().includes(skill.toLowerCase())
    );
    
    return userSkill ? userSkill.level : 0;
  }

  // Définir les étapes d'apprentissage pour une compétence
  defineLearningSteps(skill, currentLevel) {
    const stepTemplates = {
      'développement web': [
        {
          name: 'Fondamentaux',
          description: 'HTML, CSS et JavaScript de base',
          skills: ['HTML', 'CSS', 'JavaScript'],
          keywords: ['html', 'css', 'javascript', 'fondamentaux'],
          level: 'débutant',
          duration: '4-6 semaines'
        },
        {
          name: 'Framework Frontend',
          description: 'React ou Vue.js',
          skills: ['React', 'Vue.js', 'JavaScript avancé'],
          keywords: ['react', 'vue', 'framework'],
          level: 'intermédiaire',
          duration: '6-8 semaines'
        },
        {
          name: 'Backend et Bases de données',
          description: 'Node.js et MongoDB',
          skills: ['Node.js', 'MongoDB', 'API'],
          keywords: ['node', 'mongodb', 'backend', 'api'],
          level: 'intermédiaire',
          duration: '6-8 semaines'
        }
      ]
    };

    const steps = stepTemplates[skill.toLowerCase()] || [];
    
    // Filtrer selon le niveau actuel
    return steps.filter(step => {
      const levelOrder = { 'débutant': 1, 'intermédiaire': 2, 'avancé': 3 };
      const stepLevel = levelOrder[step.level];
      const userLevel = Math.ceil(currentLevel / 3.33); // Convertir 0-10 vers 1-3
      
      return stepLevel >= userLevel;
    });
  }
}

module.exports = new RecommendationService();