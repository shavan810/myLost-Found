import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Electronics', 'Jewelry', 'Documents', 'Clothing', 'Bags', 'Keys', 'Wallet', 'Pet', 'Vehicle', 'Other'],
    required: true
  },
  // Hidden details for verification (only shown to matcher after claim initiation)
  hiddenDetails: { type: String, default: '' },
  color: { type: String },
  brand: { type: String },
  images: [{ type: String }],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'matched', 'resolved', 'closed'],
    default: 'active'
  },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number, default: 0 },
  reward: { type: String, default: '' },
  contactPreference: { type: String, enum: ['email', 'phone', 'both'], default: 'email' },
  views: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

// Text index for search
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });
itemSchema.index({ 'location.city': 1, category: 1, type: 1, status: 1 });

export default mongoose.model('Item', itemSchema);
