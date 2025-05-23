const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStudyRecommendations,
  getOptimalSchedule,
  getStudyAnalytics
} = require('../controllers/aiController');

// All routes are protected
router.use(protect);

// AI recommendations
router.get('/recommendations', getStudyRecommendations);

// AI optimal schedule
router.post('/schedule', getOptimalSchedule);

// AI analytics
router.get('/analytics', getStudyAnalytics);

module.exports = router;
