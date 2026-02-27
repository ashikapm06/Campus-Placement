const express = require('express');
const axios = require('axios');
const Drive = require('../models/Drive');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/drives - Create a drive (officer only)
router.post('/', auth, requireRole('officer'), async (req, res) => {
  try {
    const {
      companyName, role, jdText, ctc, location, driveDate, applicationDeadline,
      eligibility, requiredSkills, rounds,
    } = req.body;

    const drive = new Drive({
      companyName, role, jdText, ctc, location,
      driveDate: new Date(driveDate),
      applicationDeadline: new Date(applicationDeadline),
      eligibility: {
        minCGPA: eligibility.minCGPA,
        branches: eligibility.branches || [],
        graduationYear: eligibility.graduationYear,
        backlogs: eligibility.backlogs || false,
      },
      requiredSkills: requiredSkills || [],
      rounds: rounds || [],
      createdBy: req.user._id,
    });

    await drive.save();
    res.status(201).json({ drive, message: 'Drive created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drives - Get all drives (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // Officer sees only their drives
    if (req.user.role === 'officer') {
      query.createdBy = req.user._id;
    }

    // Student sees active/upcoming drives they're eligible for
    if (req.user.role === 'student') {
      query.status = { $in: ['upcoming', 'active'] };
    }

    const drives = await Drive.find(query)
      .populate('createdBy', 'name officerProfile.institution')
      .sort({ createdAt: -1 });

    res.json({ drives, total: drives.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drives/:id - Get single drive
router.get('/:id', auth, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('eligibleStudents.studentId', 'name email studentProfile');

    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json({ drive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drives/:id/generate-eligible - AI-powered eligible student generation
router.post('/:id/generate-eligible', auth, requireRole('officer'), async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    // Step 1: Filter by eligibility criteria
    const eligibilityFilter = {
      role: 'student',
      'studentProfile.cgpa': { $gte: drive.eligibility.minCGPA },
    };

    if (drive.eligibility.branches && drive.eligibility.branches.length > 0) {
      eligibilityFilter['studentProfile.branch'] = { $in: drive.eligibility.branches };
    }

    if (drive.eligibility.graduationYear) {
      eligibilityFilter['studentProfile.graduationYear'] = drive.eligibility.graduationYear;
    }

    const eligibleStudents = await User.find(eligibilityFilter).select('-password');

    if (eligibleStudents.length === 0) {
      return res.json({ message: 'No eligible students found', students: [], total: 0 });
    }

    // Step 2: Get AI match scores
    let matchedStudents = eligibleStudents.map((s) => ({
      studentId: s._id,
      student: s,
      matchScore: 50, // fallback
    }));

    try {
      const aiPayload = {
        jd_text: drive.jdText,
        required_skills: drive.requiredSkills,
        students: eligibleStudents.map((s) => ({
          id: s._id.toString(),
          skills: s.studentProfile?.skills || [],
          resume_text: s.studentProfile?.resumeText || '',
        })),
      };

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/match`, aiPayload, { timeout: 10000 });

      if (aiResponse.data?.results) {
        const scoreMap = {};
        aiResponse.data.results.forEach((r) => {
          scoreMap[r.student_id] = r.match_score;
        });

        matchedStudents = matchedStudents.map((ms) => ({
          ...ms,
          matchScore: Math.round((scoreMap[ms.studentId.toString()] || 0.5) * 100),
        }));
      }
    } catch (aiErr) {
      console.log('AI service unavailable, using local fallback matching');
      // Local TF-IDF fallback
      matchedStudents = matchedStudents.map((ms) => {
        const score = computeLocalMatchScore(
          drive.jdText,
          drive.requiredSkills,
          ms.student.studentProfile?.skills || [],
          ms.student.studentProfile?.resumeText || ''
        );
        return { ...ms, matchScore: Math.round(score * 100) };
      });
    }

    // Sort by match score descending
    matchedStudents.sort((a, b) => b.matchScore - a.matchScore);

    // Save to drive
    drive.eligibleStudents = matchedStudents.map((ms) => ({
      studentId: ms.studentId,
      matchScore: ms.matchScore,
      status: 'eligible',
    }));
    await drive.save();

    // Return enriched results
    const result = matchedStudents.map((ms) => ({
      student: ms.student,
      matchScore: ms.matchScore,
      status: 'eligible',
    }));

    res.json({ students: result, total: result.length, message: 'Eligible students generated with AI scores' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple local TF-IDF match score fallback
function computeLocalMatchScore(jdText, requiredSkills, studentSkills, resumeText) {
  const jdLower = (jdText + ' ' + requiredSkills.join(' ')).toLowerCase();
  const studentLower = (studentSkills.join(' ') + ' ' + resumeText).toLowerCase();

  const jdWords = new Set(jdLower.match(/\b\w{3,}\b/g) || []);
  const studentWords = new Set(studentLower.match(/\b\w{3,}\b/g) || []);

  // Jaccard similarity
  const intersection = [...jdWords].filter((w) => studentWords.has(w)).length;
  const union = new Set([...jdWords, ...studentWords]).size;

  const baseScore = union > 0 ? intersection / union : 0;

  // Skill overlap bonus
  const jdSkillSet = new Set(requiredSkills.map((s) => s.toLowerCase()));
  const studentSkillSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const skillOverlap = [...jdSkillSet].filter((s) => studentSkillSet.has(s)).length;
  const skillBonus = jdSkillSet.size > 0 ? (skillOverlap / jdSkillSet.size) * 0.4 : 0;

  return Math.min(baseScore * 0.6 + skillBonus + 0.2, 1.0); // min 20% base score
}

// PUT /api/drives/:id/student-status - Update a student's status in a drive
router.put('/:id/student-status', auth, requireRole('officer'), async (req, res) => {
  try {
    const { studentId, status } = req.body;
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });

    const entry = drive.eligibleStudents.find((e) => e.studentId.toString() === studentId);
    if (!entry) return res.status(404).json({ error: 'Student not in this drive' });

    entry.status = status;

    if (status === 'selected') {
      await User.findByIdAndUpdate(studentId, {
        $set: { 'studentProfile.isPlaced': true, 'studentProfile.placedAt': drive.companyName },
      });
    }

    await drive.save();
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drives/:id - Delete drive
router.delete('/:id', auth, requireRole('officer'), async (req, res) => {
  try {
    const drive = await Drive.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json({ message: 'Drive deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
