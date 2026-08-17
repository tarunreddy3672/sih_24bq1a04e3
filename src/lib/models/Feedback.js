import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  subjectOrFacultyId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    default: '',
  },
  anonymized: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FeedbackSchema.index({ subjectOrFacultyId: 1, createdAt: -1 });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
