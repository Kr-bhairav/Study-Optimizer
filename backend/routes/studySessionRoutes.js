const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createStudySession,
  getStudySessions,
  getRevisionReminders,
  completeStudySession
} = require('../controllers/studySessionController');

// All routes are protected
router.use(protect);

router.post('/', createStudySession);
router.get('/', getStudySessions);
router.get('/reminders', getRevisionReminders);
router.put('/complete', completeStudySession);

module.exports = router;