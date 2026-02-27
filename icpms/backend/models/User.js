const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'officer'], required: true },

    // Student-specific fields
    studentProfile: {
      cgpa: { type: Number, min: 0, max: 10 },
      branch: { type: String, trim: true },
      graduationYear: { type: Number },
      skills: [{ type: String, trim: true }],
      resumeText: { type: String }, // extracted text from resume
      resumeUrl: { type: String },
      linkedIn: { type: String },
      github: { type: String },
      phone: { type: String },
      isPlaced: { type: Boolean, default: false },
      placedAt: { type: String },
    },

    // Officer-specific fields
    officerProfile: {
      institution: { type: String },
      department: { type: String },
      employeeId: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
