const express = require('express');
const {
    getMyApplications,
    updateApplicationStatus,
    getAllApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Job Seeker routes
router.get('/my', authorize('jobSeeker'), getMyApplications);

// Recruiter routes
router.patch('/:id/status', authorize('recruiter'), updateApplicationStatus);

// Admin routes
router.get('/', authorize('admin'), getAllApplications);

module.exports = router;