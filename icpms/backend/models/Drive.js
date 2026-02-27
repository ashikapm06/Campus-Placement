const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdText: { type: String, required: true }, // Full job description text for AI matching
    ctc: { type: String, required: true }, // e.g., "8-12 LPA"
    location: { type: String, required: true },
    driveDate: { type: Date, required: true },
    applicationDeadline: { type: Date, required: true },

    // Eligibility criteria
    eligibility: {
      minCGPA: { type: Number, required: true, min: 0, max: 10 },
      branches: [{ type: String }], // ['CSE', 'IT', 'ECE'] or [] for all
      graduationYear: { type: Number },
      backlogs: { type: Boolean, default: false }, // false = no backlogs allowed
    },

    requiredSkills: [{ type: String, trim: true }],
    rounds: [{ type: String }], // ['Online Test', 'Group Discussion', 'Technical Interview', 'HR Interview']

    status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Matched students (populated after officer clicks "Generate Eligible")
    eligibleStudents: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchScore: { type: Number, min: 0, max: 100 },
        status: {
          type: String,
          enum: ['eligible', 'applied', 'shortlisted', 'selected', 'rejected'],
          default: 'eligible',
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drive', driveSchema);
