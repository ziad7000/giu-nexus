const Application = require('../models/Application');
const JobPost = require('../models/JobPost');
const User = require('../models/User');

// ==================== APPLICATIONS ====================

// @desc    Apply to a job
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Job Seeker only
exports.applyToJob = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const existingApp = await Application.findOne({
            user: req.user._id,
            job: req.params.jobId
        });

        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        const application = await Application.create({
            user: req.user._id,
            job: req.params.jobId,
            coverLetter: req.body.coverLetter || ''
        });

        res.status(201).json({
            success: true,
            application
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get applicants for a job (recruiter only)
// @route   GET /api/v1/jobs/:jobId/applicants
// @access  Recruiter (must own the job)
exports.getJobApplicants = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applicants for this job'
            });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('user', 'name email skills profilePicture');

        res.json({
            success: true,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get my applications (job seeker)
// @route   GET /api/v1/applications/my
// @access  Job Seeker only
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .populate('job', 'title company type status location');

        res.json({
            success: true,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update application status (recruiter only)
// @route   PATCH /api/v1/applications/:id/status
// @access  Recruiter (must own the job)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, shortlisted, or rejected'
            });
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        application.status = status;
        await application.save();

        res.json({
            success: true,
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all applications (admin only)
// @route   GET /api/v1/applications
// @access  Admin only
exports.getAllApplications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const applications = await Application.find()
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email')
            .populate('job', 'title company');

        const total = await Application.countDocuments();

        res.json({
            success: true,
            total,
            page,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};