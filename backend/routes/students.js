const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files allowed'));
    }
  },
});

// GET /api/students/profile - get own profile
router.get('/profile', auth, requireRole('student'), async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/profile - update profile
router.put('/profile', auth, requireRole('student'), async (req, res) => {
  try {
    const { cgpa, branch, graduationYear, skills, linkedIn, github, phone } = req.body;

    const updateData = {
      'studentProfile.cgpa': cgpa,
      'studentProfile.branch': branch,
      'studentProfile.graduationYear': graduationYear,
      'studentProfile.skills': Array.isArray(skills)
        ? skills
        : skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      'studentProfile.linkedIn': linkedIn,
      'studentProfile.github': github,
      'studentProfile.phone': phone,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const student = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true });
    res.json({ student, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/upload-resume
router.post('/upload-resume', auth, requireRole('student'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let extractedText = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } catch (e) {
        console.log('PDF parse error:', e.message);
        extractedText = '';
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'studentProfile.resumeUrl': `/uploads/resumes/${req.file.filename}`,
        'studentProfile.resumeText': extractedText,
      },
    });

    res.json({
      message: 'Resume uploaded successfully',
      filename: req.file.filename,
      extractedText: extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : ''),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/all - for officers only
router.get('/all', auth, requireRole('officer'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ students, total: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/stats - dashboard stats
router.get('/stats', auth, requireRole('officer'), async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'student' });
    const placed = await User.countDocuments({ role: 'student', 'studentProfile.isPlaced': true });
    const withProfiles = await User.countDocuments({
      role: 'student',
      'studentProfile.cgpa': { $exists: true, $ne: null },
    });

    const branchStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$studentProfile.branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ total, placed, unplaced: total - placed, withProfiles, branchStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
