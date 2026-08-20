import mongoose from 'mongoose';

const VideoLectureSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  subject:     { type: String, required: true },
  branch:      { type: String, default: 'CSE' },   // e.g. CSE, ECE, IT, AI
  section:     { type: String, default: '' },       // e.g. CSE-A, ECE-B
  videoUrl:    { type: String, required: true },    // YouTube / Drive / direct URL
  duration:    { type: String, default: '' },       // e.g. "45 min"
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now },
});

VideoLectureSchema.index({ subject: 1, branch: 1 });

export default mongoose.models.VideoLecture || mongoose.model('VideoLecture', VideoLectureSchema);
