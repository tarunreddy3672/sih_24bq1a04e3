import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  externalId: { type: String, required: true },          // Moodle course id or GClassroom course id
  source: { type: String, enum: ['moodle', 'google_classroom', 'manual'], default: 'manual' },
  name: { type: String, required: true },
  section: { type: String, default: '' },                // e.g. "CSE-A"
  subject: { type: String, default: '' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  enrolledStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  syncedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

CourseSchema.index({ externalId: 1, source: 1 }, { unique: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
