import mongoose from 'mongoose';

const ManualAttendanceSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  section:   { type: String, required: true },
  subject:   { type: String, required: true },
  date:      { type: Date,   required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String },
    status:    { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  }],
  createdAt: { type: Date, default: Date.now },
});

ManualAttendanceSchema.index({ facultyId: 1, date: -1 });
ManualAttendanceSchema.index({ section: 1, date: -1 });

export default mongoose.models.ManualAttendance || mongoose.model('ManualAttendance', ManualAttendanceSchema);
