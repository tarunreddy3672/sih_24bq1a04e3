import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true, default: 'student' },
  classOrSubject: { type: String, default: 'CSE-A' },
  subjects: { type: [String], default: [] },  // 5 theory subjects
  labs:     { type: [String], default: [] },  // 3 lab subjects
  faceEmbedding: { type: [Number], default: [] },
  passwordHash: { type: String, required: true },
  guardianPhone: { type: String, default: '' },   // e.g. "+919876543210" — used for WhatsApp/SMS alerts
  languagePreference: { type: String, enum: ['en', 'te', 'hi'], default: 'en' },
  accessibilitySettings: {
    fontSize:      { type: String, enum: ['normal', 'large', 'xlarge'], default: 'normal' },
    highContrast:  { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ role: 1 });
UserSchema.index({ classOrSubject: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
