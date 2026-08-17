import mongoose from 'mongoose';

const StreakSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0,
  },
  badges: [{
    type: String,
    trim: true,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

StreakSchema.index({ currentStreak: -1 });

export default mongoose.models.Streak || mongoose.model('Streak', StreakSchema);
