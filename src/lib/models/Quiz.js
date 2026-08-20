import mongoose from 'mongoose';

const QuizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
});

const QuizSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  branch:  { type: String, default: 'CSE' },
  section: { type: String, default: '' },
  questions: [QuizQuestionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuizSchema.index({ subject: 1, branch: 1, section: 1, createdAt: -1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
