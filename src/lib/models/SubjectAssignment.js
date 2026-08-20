import mongoose from 'mongoose';

const SubjectAssignmentSchema = new mongoose.Schema({
  section:   { type: String, required: true },   // e.g. "CSE-A"
  subject:   { type: String, required: true },   // e.g. "Digital Electronics"
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SubjectAssignmentSchema.index({ section: 1 }, { unique: true });

export default mongoose.models.SubjectAssignment || mongoose.model('SubjectAssignment', SubjectAssignmentSchema);
