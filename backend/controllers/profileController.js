const User = require('../models/User');
const bcrypt = require('bcryptjs');
const hf = require('../services/hfService');

// @desc    Get logged-in user's profile
// @route   GET /api/v1/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update profile
// @route   PATCH /api/v1/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'profilePicture'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PATCH /api/v1/profile/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Extract skills from user's bio using AI
// @route   POST /api/v1/profile/extract-skills
// @access  Job Seeker only
exports.extractSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.bio || user.bio.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Bio is empty. Update your profile first.'
      });
    }
    
    try {
      const result = await hf.tokenClassification({
        model: "dslim/bert-base-NER",
        inputs: user.bio
      });

      // Merge subword tokens back into full words
      const mergedEntities = [];
      for (const entity of result) {
        const label = entity.entity_group || entity.entity || "";
        if (!label.includes('ORG') && !label.includes('MISC') && !label.includes('PER')) continue;
        
        const word = entity.word;
        if (word.startsWith('##') && mergedEntities.length > 0) {
          mergedEntities[mergedEntities.length - 1] += word.replace('##', '');
        } else {
          mergedEntities.push(word);
        }
      }

      let uniqueSkills = [...new Set(mergedEntities)].filter(s => s.length > 1);

      if (uniqueSkills.length === 0) {
        uniqueSkills = user.bio.match(/[A-Z][a-zA-Z.#+]+/g) || [];
      }

      user.skills = uniqueSkills;
      await user.save();
      
      res.json({
        success: true,
        skills: user.skills,
        extracted: uniqueSkills
      });
    } catch (aiError) {
      console.error('AI extraction failed:', aiError);
      res.json({
        success: true,
        skills: user.skills,
        extracted: []
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};