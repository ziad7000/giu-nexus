const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  toggleSaveJob,
  getSavedJobs,
  generateCoverLetter
} = require('../controllers/jobController');
const {
  applyToJob,
  getJobApplicants
} = require('../controllers/applicationController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');

const router = express.Router();

// ========== PUBLIC ROUTES ==========
router.get('/', optionalProtect, getJobs);
// ========== PROTECTED ROUTES ==========
router.use(protect);

// JOB SEEKER ROUTES
router.get('/recommended', authorize('jobSeeker'), getRecommendedJobs);
router.get('/saved', authorize('jobSeeker'), getSavedJobs);
router.post('/:id/save', authorize('jobSeeker'), toggleSaveJob);
router.post('/:jobId/apply', authorize('jobSeeker'), applyToJob);
router.post('/:id/cover-letter', authorize('jobSeeker'), generateCoverLetter);

// RECRUITER ROUTES
router.get('/my-jobs', authorize('recruiter'), getMyJobs);
router.get('/:jobId/applicants', authorize('recruiter'), getJobApplicants);
router.post('/', authorize('recruiter'), createJob);
router.patch('/:id', authorize('recruiter'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);

// ========== THIS MUST BE LAST ==========
router.get('/:id', getJob);

module.exports = router;