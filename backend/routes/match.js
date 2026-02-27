const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/match/score - compute match score for a student vs JD
router.post('/score', auth, async (req, res) => {
  try {
    const { jdText, requiredSkills, studentSkills, resumeText } = req.body;

    const score = computeMatchScore(
      jdText || '',
      requiredSkills || [],
      studentSkills || [],
      resumeText || ''
    );

    const breakdown = getScoreBreakdown(jdText || '', requiredSkills || [], studentSkills || []);

    res.json({
      matchScore: Math.round(score * 100),
      percentage: `${Math.round(score * 100)}%`,
      breakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function tokenize(text) {
  return (text.toLowerCase().match(/\b[a-z][a-z0-9+#.]{1,}\b/g) || []);
}

function tfIdf(text) {
  const words = tokenize(text);
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, normA = 0, normB = 0;
  allKeys.forEach((k) => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeMatchScore(jdText, requiredSkills, studentSkills, resumeText) {
  const jdFull = jdText + ' ' + requiredSkills.join(' ');
  const studentFull = studentSkills.join(' ') + ' ' + resumeText;

  const jdVec = tfIdf(jdFull);
  const studentVec = tfIdf(studentFull);

  const textSimilarity = cosineSimilarity(jdVec, studentVec);

  const jdSkillSet = new Set(requiredSkills.map((s) => s.toLowerCase().trim()));
  const studentSkillSet = new Set(studentSkills.map((s) => s.toLowerCase().trim()));
  const matched = [...jdSkillSet].filter((s) => studentSkillSet.has(s)).length;
  const skillScore = jdSkillSet.size > 0 ? matched / jdSkillSet.size : 0.5;

  // Weighted: 60% text similarity + 40% skill overlap
  const combined = textSimilarity * 0.6 + skillScore * 0.4;

  // Normalize to 30-95 range for better UX
  return 0.30 + combined * 0.65;
}

function getScoreBreakdown(jdText, requiredSkills, studentSkills) {
  const jdSkillSet = new Set(requiredSkills.map((s) => s.toLowerCase().trim()));
  const studentSkillSet = new Set(studentSkills.map((s) => s.toLowerCase().trim()));

  const matched = [...jdSkillSet].filter((s) => studentSkillSet.has(s));
  const missing = [...jdSkillSet].filter((s) => !studentSkillSet.has(s));

  return {
    matchedSkills: matched,
    missingSkills: missing,
    totalRequired: requiredSkills.length,
    totalMatched: matched.length,
  };
}

module.exports = router;
