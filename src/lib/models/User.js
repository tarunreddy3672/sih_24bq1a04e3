import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true,
    default: 'student',
  },
  classOrSubject: {
    type: String,
    default: 'CSE-A',
  },
  faceEmbedding: {
    type: [Number],
    default: [],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for rapid lookups and role-based querying
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ classOrSubject: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
