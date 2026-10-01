import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  targetType: { type: String, enum: ['destination', 'package', 'vehicle', 'service'], default: 'package' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetSlug: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
