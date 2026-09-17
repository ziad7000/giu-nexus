const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below this line require the user to be logged in
router.use(protect);

// Existing Profile Routes
router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/change-password', changePassword);

// New AI Skill Extraction Route (Only for Job Seekers)
router.post('/extract-skills', authorize('jobSeeker'), extractSkills);

module.exports = router;