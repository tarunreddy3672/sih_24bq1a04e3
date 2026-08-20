import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true, default: 'present' },
  confidenceScore: { type: Number, min: 0, max: 100, default: 95 },
  livenessVerified: { type: Boolean, default: false },   // true = passed liveness challenge
  livenessChallenge: { type: String, default: '' },      // 'blink' | 'smile' | 'turn' | 'manual'
  alertSentAt: { type: Date, default: null },            // dedup: last WhatsApp alert timestamp
  createdAt: { type: Date, default: Date.now },
});

AttendanceRecordSchema.index({ studentId: 1, date: -1 });
AttendanceRecordSchema.index({ facultyId: 1, date: -1 });

export default mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord', AttendanceRecordSchema);
