import mongoose from 'mongoose';

const QuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  weakTopics: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuizAttemptSchema.index({ studentId: 1, createdAt: -1 });
QuizAttemptSchema.index({ quizId: 1 });

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
