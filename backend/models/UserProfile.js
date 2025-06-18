// models/UserProfile.js
const mongoose = require('mongoose');

const skillAssessmentSchema = new mongoose.Schema({
  skill: String,
  level: {
    type: Number,
    min: 0,
    max: 10
  },
  assessedAt: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['self-assessment', 'quiz', 'project'],
    default: 'self-assessment'
  }
});

const learningGoalSchema = new mongoose.Schema({
  goal: String,
  category: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetDate: Date,
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const enrollmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedModules: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'dropped'],
    default: 'active'
  },
  lastAccessedAt: Date,
  completedAt: Date
});

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Informations professionnelles
  currentJob: String,
  industry: String,
  experience: {
    type: String,
    enum: ['débutant', '1-3 ans', '3-5 ans', '5-10 ans', '10+ ans']
  },
  
  // Objectifs et préférences
  careerGoals: [String],
  learningGoals: [learningGoalSchema],
  preferredLearningStyle: {
    type: String,
    enum: ['visuel', 'auditif', 'kinesthésique', 'lecture']
  },
  availableTimePerWeek: Number, // heures par semaine
  preferredSchedule: {
    type: String,
    enum: ['matin', 'après-midi', 'soir', 'weekend', 'flexible']
  },
  
  // Compétences et évaluations
  skills: [skillAssessmentSchema],
  interests: [String],
  
  // Formations et progression
  enrollments: [enrollmentSchema],
  completedCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    completedAt: Date,
    finalScore: Number,
    certification: Boolean
  }],
  
  // Préférences de recommandation
  recommendationPreferences: {
    difficulty: {
      type: String,
      enum: ['conservative', 'moderate', 'challenging'],
      default: 'moderate'
    },
    focusAreas: [String],
    excludeCategories: [String]
  },
  
  // Statistiques
  totalLearningHours: {
    type: Number,
    default: 0
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour updatedAt
userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;