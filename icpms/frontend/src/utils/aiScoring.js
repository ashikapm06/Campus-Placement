/**
 * aiScoring.js
 * 
 * Utility functions for AI-based evaluation in the Intelligent Campus Placement System.
 */

/**
 * Calculates a Match Score between a student and a job.
 * Weights:
 * - 40% Skill overlap (student skills vs job skills)
 * - 25% CGPA eligibility score
 * - 20% Project relevance
 * - 15% Resume keyword analysis
 * 
 * @param {Object} student - Student profile data
 * @param {Object} job - Job requirements data
 * @returns {Object} Score breakdown and final match percentage
 */
export const calculateMatchScore = (student, job) => {
    // 1. Skill Overlap (40%)
    const studentSkills = student?.skills?.map(s => s.toLowerCase()) || [];
    const jobSkills = job?.requiredSkills?.map(s => s.toLowerCase()) || [];
    let skillScore = 0;
    if (jobSkills.length > 0) {
        const matchedSkills = jobSkills.filter(skill => studentSkills.includes(skill));
        skillScore = (matchedSkills.length / jobSkills.length) * 40;
    } else {
        skillScore = 40; // If no skills required, full mask
    }

    // 2. CGPA Eligibility (25%)
    const studentCgpa = parseFloat(student?.cgpa) || 0;
    const reqCgpa = parseFloat(job?.minCgpa) || 0;
    let cgpaScore = 0;
    if (studentCgpa >= reqCgpa) {
        cgpaScore = 25; // Meets basic criteria
        // Bonus for higher CGPA (up to 25 total)
        const bonus = Math.min((studentCgpa - reqCgpa) * 5, 0); // Not adding extra for now, capped at 25
        cgpaScore += bonus;
    } else {
        // Partial score if close
        const diff = reqCgpa - studentCgpa;
        if (diff <= 1.0) cgpaScore = Math.max(25 - (diff * 20), 0);
    }

    // 3. Project Relevance (20%)
    // Simple check: does the student have projects overlapping with job roles/skills?
    const studentProjects = student?.projects || [];
    let projectScore = 0;
    let foundKeywords = 0;
    studentProjects.forEach(p => {
        const desc = (p.description || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        jobSkills.forEach(js => {
            if (desc.includes(js) || title.includes(js)) foundKeywords++;
        });
    });
    // Cap at 20
    projectScore = Math.min(foundKeywords * 5, 20);

    // 4. Resume Keyword Analysis (15%)
    // Assume we have some keyword matching from backend, or simulate it here
    const resumeScoreRaw = student?.resumeScore || 0; // 0-100
    const resumeScore = (resumeScoreRaw / 100) * 15;

    const totalScore = Math.round(skillScore + cgpaScore + projectScore + resumeScore);

    return {
        matchPercentage: totalScore,
        breakdown: {
            skillOverlap: { score: Math.round(skillScore), max: 40, label: "Skill Overlap" },
            cgpaEligibility: { score: Math.round(cgpaScore), max: 25, label: "CGPA/Academics" },
            projectRelevance: { score: Math.round(projectScore), max: 20, label: "Project Relevance" },
            resumeKeywords: { score: Math.round(resumeScore), max: 15, label: "Resume Match" }
        }
    };
};

/**
 * Calculates a student's Readiness Index.
 * 
 * @param {Object} profile - Student profile data
 * @returns {Object} Index score and gap insights
 */
export const calculateReadiness = (profile) => {
    let score = 0;
    let strengths = [];
    let gaps = [];

    // 1. Profile Completeness (Max 30)
    let completeness = 0;
    if (profile?.resumeUrl) { completeness += 10; strengths.push("Resume uploaded"); }
    else { gaps.push("Upload your resume to improve visibility"); }

    if (profile?.skills?.length > 3) { completeness += 10; strengths.push("Good skill coverage"); }
    else { gaps.push("Add more technical skills to your profile"); }

    if (profile?.projects?.length > 0) { completeness += 10; strengths.push("Projects added"); }
    else { gaps.push("Add academic or personal projects"); }

    score += completeness;

    // 2. Market Demand vs Skills (Max 40)
    // Simulated market demand: React, Node.js, Python, AWS, SQL
    const marketDemand = ['react', 'node.js', 'python', 'aws', 'sql', 'java', 'c++'];
    const userSkills = profile?.skills?.map(s => s.toLowerCase()) || [];
    const matchedMarket = marketDemand.filter(s => userSkills.includes(s));

    const marketScore = Math.min((matchedMarket.length / 3) * 40, 40); // Need at least 3 high-demand skills for full 40
    score += marketScore;

    if (matchedMarket.length < 2) {
        gaps.push("Missing high-demand industry skills (e.g., Cloud, Modern Web Dev)");
    }

    // 3. Academics & Mock Scores (Max 30)
    let academicScore = 0;
    const cgpa = parseFloat(profile?.cgpa) || 0;
    if (cgpa >= 8.5) { academicScore = 30; strengths.push("Excellent CGPA"); }
    else if (cgpa >= 7.5) { academicScore = 20; strengths.push("Good CGPA"); }
    else if (cgpa >= 6.0) { academicScore = 10; gaps.push("Maintain or improve CGPA for more shortlists"); }
    else { gaps.push("Low CGPA might restrict some company drives"); }

    score += academicScore;

    return {
        index: Math.round(score),
        strengths,
        gaps
    };
};
