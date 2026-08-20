import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // The subject name (e.g. "Digital Electronics & VLSI")
  subjectOrFacultyId: {
    type: String,
    required: true,
  },
  // The actual faculty ObjectId this feedback targets
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
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
FeedbackSchema.index({ facultyId: 1, createdAt: -1 });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
