const JobPost = require('../models/JobPost');
const User = require('../models/User');
const hf = require('../services/hfService');      

// Cosine similarity calculation for vector comparison
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

// Helper function: AI Category Classification
const classifyCategory = async (description) => {
  try {
    const result = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: description,
      parameters: {
        candidate_labels: ["Frontend", "Backend", "AI/ML", "DevOps", "Data Engineering", "Other"]
      }
    });


    const output = Array.isArray(result) ? result[0] : result;
    return output.label; // not output.labels[0]
  } catch (error) {
    console.error('Classification failed:', error.message);
    console.error('Full error:', error);
    return 'Other';
  }
};

// @desc    Get all jobs (public, paginated, filterable)
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (req.query.keyword) {
      filter.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { company: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const jobs = await JobPost.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');
    
    const total = await JobPost.countDocuments(filter);

    let savedJobIds = [];
    if (req.user) {
      const user = await User.findById(req.user._id);
      savedJobIds = user.savedJobs.map(id => id.toString());
    }

    const jobsWithSaved = jobs.map(job => ({
      ...job.toObject(),
      isSaved: savedJobIds.includes(job._id.toString())
    }));
    
    res.json({
      success: true,
      total,
      page,
      jobs: jobsWithSaved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create job (recruiter only, must be approved)
// @route   POST /api/v1/jobs
// @access  Recruiter (approved only)
// @desc    Create job (recruiter only, must be approved)
// @route   POST /api/v1/jobs
// @access  Recruiter (approved only)
exports.createJob = async (req, res) => {
  try {

    // Check if recruiter is approved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Wait for admin approval before posting jobs.'
      });
    }

    // AI Classification
    const category = await classifyCategory(req.body.description);

    const job = await JobPost.create({
      ...req.body,
      category,           // auto-assigned by AI
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recruiter's own jobs
// @route   GET /api/v1/jobs/my-jobs
// @access  Recruiter only
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find({ createdBy: req.user._id });
    
    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job (recruiter owner only)
// @route   PATCH /api/v1/jobs/:id
// @access  Recruiter (owner only)
// @desc    Update job (recruiter owner only)
// @route   PATCH /api/v1/jobs/:id
// @access  Recruiter (owner only)
exports.updateJob = async (req, res) => {
  try {
    let job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns this job
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this job'
      });
    }

    // Re-classify if description changed
    if (req.body.description && req.body.description !== job.description) {
      req.body.category = await classifyCategory(req.body.description);
    }
    
    job = await JobPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete job (recruiter owner or admin)
// @route   DELETE /api/v1/jobs/:id
// @access  Recruiter (owner) or Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const isOwner = job.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }
    
    await job.deleteOne();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==================== AI JOB RECOMMENDATIONS ====================

// @desc    Get job recommendations based on user's skills
// @route   GET /api/v1/jobs/recommended
// @access  Job Seeker only
exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobs = await JobPost.find({ status: 'open' });

    // Get saved job IDs for this user
    const savedJobIds = user.savedJobs.map(id => id.toString());

    if (!user.skills || user.skills.length === 0) {
      return res.json({
        success: true,
        jobs: jobs.map(job => ({ ...job.toObject(), isSaved: savedJobIds.includes(job._id.toString()) })),
        message: 'Add skills to your profile to get personalized recommendations'
      });
    }

    if (jobs.length === 0) {
      return res.json({ success: true, jobs: [], message: 'No open jobs available' });
    }

    const studentText = user.skills.join(', ');
    const jobTexts = jobs.map(job =>
      `${job.title} ${job.requirements ? job.requirements.join(', ') : ''}`
    );

    try {
      const embeddings = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [studentText, ...jobTexts]
      });

      const studentVector = embeddings[0];
      const jobsWithScores = jobs.map((job, index) => ({
        ...job.toObject(),
        isSaved: savedJobIds.includes(job._id.toString()),
        score: cosineSimilarity(studentVector, embeddings[index + 1])
      }));

      jobsWithScores.sort((a, b) => b.score - a.score);

      res.json({ success: true, jobs: jobsWithScores });
    } catch (aiError) {
      console.error('Recommendation failed:', aiError.message);
      res.json({
        success: true,
        jobs: jobs.map(job => ({ ...job.toObject(), isSaved: savedJobIds.includes(job._id.toString()) })),
        message: 'AI service unavailable. Showing all jobs.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SAVE JOBS ====================

// @desc    Save or unsave a job (toggle)
// @route   POST /api/v1/jobs/:id/save
// @access  Job Seeker only
exports.toggleSaveJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot save a closed job'
      });
    }
    
    const user = await User.findById(req.user._id);
    const isSaved = user.savedJobs.includes(job._id);
    
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(
        id => id.toString() !== job._id.toString()
      );
      await user.save();
      
      res.json({
        success: true,
        message: 'Job removed from saved',
        saved: false
      });
    } else {
      user.savedJobs.push(job._id);
      await user.save();
      
      res.json({
        success: true,
        message: 'Job saved',
        saved: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all saved jobs for logged-in user
// @route   GET /api/v1/jobs/saved
// @access  Job Seeker only
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    const jobs = user.savedJobs.map(job => ({
      ...job.toObject(),
      isSaved: true
    }));

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    const bio = user.bio || 'A motivated job seeker looking for new opportunities';

    const prompt = `Write a professional cover letter for the following job and applicant. Return only the cover letter text, nothing else.

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description}

Applicant Name: ${user.name}
Applicant Bio: ${bio}

Cover Letter:`;

    console.log('Generating cover letter for job:', job.title);

    const response = await hf.chatCompletion({
model: 'meta-llama/Llama-3.1-8B-Instruct',
  messages: [
    {
      role: 'user',
      content: prompt
    }
  ],
  max_tokens: 500,
  temperature: 0.7,
});

console.log('Cover letter response:', JSON.stringify(response));
const generated = response.choices[0].message.content;

    res.json({
      success: true,
      coverLetter: generated
    });
  } catch (error) {
    console.error('Cover letter error:', error.message);
    console.error('Cover letter full error:', JSON.stringify(error, null, 2));
    res.status(500).json({ success: false, message: error.message });
  }
};