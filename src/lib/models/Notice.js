import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['warning', 'notice', 'appreciation', 'urgent'], default: 'notice' },
  subject:    { type: String, required: true },
  message:    { type: String, required: true },
  isRead:     { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
});

NoticeSchema.index({ studentId: 1, createdAt: -1 });
NoticeSchema.index({ facultyId: 1, createdAt: -1 });

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
