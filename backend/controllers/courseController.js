// controllers/courseController.js

const { Course } = require('../models');

// GET /search
exports.searchCourses = async (req, res) => {
  const { q } = req.query;
  try {
    const courses = await Course.findAll({
      where: {
        title: { $like: `%${q}%` }
      }
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la recherche", error: err.message });
  }
};

// GET /category/:category
exports.getCoursesByCategory = async (req, res) => {
  const category = req.params.category;
  try {
    const courses = await Course.findAll({ where: { category } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Erreur catégorie", error: err.message });
  }
};

// GET /:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours non trouvé" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: "Erreur récupération du cours", error: err.message });
  }
};

// POST /:id/enroll
exports.enrollCourse = async (req, res) => {
  try {
    // Exemple simplifié
    res.status(200).json({ message: `Utilisateur inscrit au cours ${req.params.id}` });
  } catch (err) {
    res.status(500).json({ message: "Erreur d'inscription", error: err.message });
  }
};

// GET /recommendations/personal
exports.getPersonalRecommendations = async (req, res) => {
  try {
    // Logique fictive
    const courses = await Course.findAll({ limit: 3 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Erreur recommandations", error: err.message });
  }
};
