// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const {
  searchCourses,
  getPersonalRecommendations,
  getCourse,
  enrollCourse,
  getCoursesByCategory
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/search', searchCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/:id', getCourse);

// Routes protégées
router.use(protect);
router.get('/recommendations/personal', getPersonalRecommendations);
router.post('/:id/enroll', enrollCourse);

module.exports = router;
