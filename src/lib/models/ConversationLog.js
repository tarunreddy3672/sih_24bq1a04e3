import mongoose from 'mongoose';

const ConversationLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Snapshot of student context at session start (for audit / AI grounding)
  context: {
    weakTopics:   [{ type: String }],
    riskScore:    { type: Number, default: 0 },
    riskTier:     { type: String, default: 'Low' },
    successScore: { type: Number, default: 0 },
    language:     { type: String, default: 'en' },
  },

  // Messages — capped at 40 per session to control token cost
  messages: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],

  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
});

ConversationLogSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.models.ConversationLog || mongoose.model('ConversationLog', ConversationLogSchema);
