import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  subject:     { type: String, required: true },
  branch:      { type: String, default: 'CSE' },
  section:     { type: String, default: '' },        // e.g. CSE-A
  type:        { type: String, enum: ['note', 'resource', 'announcement'], default: 'note' },
  resourceUrl: { type: String, default: '' },        // optional link
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now },
});

NoteSchema.index({ subject: 1, branch: 1, section: 1, createdAt: -1 });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
