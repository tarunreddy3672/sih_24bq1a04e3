import mongoose from 'mongoose';

const InterventionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['mentor_meeting', 'remedial_content', 'learning_plan', 'assignment_recovery',
           'ai_tutoring', 'practice_test', 'attendance_followup'],
    required: true,
  },

  // Why this intervention was triggered
  reason: { type: String, required: true },
  riskFactors: [{ type: String }],
  riskScoreAtCreation: { type: Number, default: 0 },

  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },

  // Outcome recorded when status → completed
  outcome: { type: String, default: '' },
  successScoreAfter: { type: Number, default: null },
  riskScoreAfter:    { type: Number, default: null },

  notes: { type: String, default: '' },

  createdAt:  { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

InterventionSchema.index({ studentId: 1, createdAt: -1 });
InterventionSchema.index({ facultyId: 1, status: 1 });

export default mongoose.models.Intervention || mongoose.model('Intervention', InterventionSchema);
