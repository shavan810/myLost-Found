import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  score: { type: Number, required: true }, // 0-100
  matchReasons: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'verified', 'rejected', 'resolved'],
    default: 'pending'
  },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationData: {
    lostOwnerOtpSent: { type: Boolean, default: false },
    foundOwnerOtpSent: { type: Boolean, default: false },
    lostOwnerVerified: { type: Boolean, default: false },
    foundOwnerVerified: { type: Boolean, default: false },
    lostOwnerOtp: String,
    foundOwnerOtp: String,
    otpExpiry: Date
  },
  proofSubmitted: {
    description: String,
    images: [String],
    submittedAt: Date
  },
  resolvedAt: Date,
  notes: String
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
