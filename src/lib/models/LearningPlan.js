import mongoose from 'mongoose';

const LearningPlanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Context that generated this plan
  weakTopics:  [{ type: String }],
  riskFactors: [{ type: String }],
  riskScoreAtGeneration: { type: Number, default: 0 },

  // The plan content (mirrors study-plan API response shape)
  summary:    { type: String, default: '' },
  focusAreas: [{ type: String }],
  days: [{
    day:                 Number,
    title:               String,
    duration:            String,
    concepts:            [String],
    actionItems:         [String],
    recommendedResource: String,
  }],
  estimatedScoreBoost: { type: String, default: '' },

  source: { type: String, default: 'deterministic-intelligence' },
  status: { type: String, enum: ['active', 'completed', 'superseded'], default: 'active' },

  generatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

LearningPlanSchema.index({ studentId: 1, status: 1 });
LearningPlanSchema.index({ studentId: 1, generatedAt: -1 });

export default mongoose.models.LearningPlan || mongoose.model('LearningPlan', LearningPlanSchema);
