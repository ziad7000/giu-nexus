const User = require('../models/User');
const JobPost = require('../models/JobPost');
const Application = require('../models/Application');


exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    let filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    
    const users = await User.find(filter).skip(skip).limit(limit).select('-password');
    const total = await User.countDocuments(filter);
    res.json({ success: true, total, page, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status (approve/reject)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = status;
    await user.save();
    res.json({ success: true, user: { _id: user._id, status: user.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform statistics
// @route   GET /api/v1/admin/stats
// @access  Admin only
exports.getStats = async (req, res) => {
  try {
    // 1. Count users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 2. Count jobs by status
    const jobsByStatus = await JobPost.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Count applications by status
    const appsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Get top 5 jobs with most applications
    const topJobs = await Application.aggregate([
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobposts',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          _id: 0,
          title: '$job.title',
          company: '$job.company',
          applicationCount: '$count'
        }
      }
    ]);

    // Convert arrays to objects
    const usersByRoleObj = {};
    usersByRole.forEach(item => { usersByRoleObj[item._id] = item.count; });

    const jobsByStatusObj = {};
    jobsByStatus.forEach(item => { jobsByStatusObj[item._id] = item.count; });

    const appsByStatusObj = {};
    appsByStatus.forEach(item => { appsByStatusObj[item._id] = item.count; });

    res.json({
      success: true,
      stats: {
        usersByRole: usersByRoleObj,
        jobsByStatus: jobsByStatusObj,
        appsByStatus: appsByStatusObj,
        topJobs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};