import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['match_found', 'claim_received', 'otp_sent', 'item_resolved', 'proof_required', 'general'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  relatedMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
