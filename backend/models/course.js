// models/Course.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: Number, // en heures
  difficulty: {
    type: String,
    enum: ['débutant', 'intermédiaire', 'avancé'],
    required: true
  },
  skills: [String], // Compétences acquises
  prerequisites: [String], // Prérequis
  content: [{
    chapter: String,
    topics: [String]
  }]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Développement Web',
      'Data Science & IA', 
      'Marketing Digital',
      'Gestion de Projet',
      'Design UX/UI',
      'Cybersécurité',
      'Entrepreneuriat',
      'Langues'
    ]
  },
  subcategory: String,
  level: {
    type: String,
    enum: ['débutant', 'intermédiaire', 'avancé'],
    required: true
  },
  duration: {
    type: Number, // en heures
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  skills: [String], // Compétences principales
  prerequisites: [String], // Prérequis
  learningObjectives: [String], // Objectifs d'apprentissage
  modules: [moduleSchema],
  tags: [String],
  language: {
    type: String,
    default: 'Français'
  },
  format: {
    type: String,
    enum: ['vidéo', 'text', 'interactif', 'mixte'],
    default: 'mixte'
  },
  certification: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ skills: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;