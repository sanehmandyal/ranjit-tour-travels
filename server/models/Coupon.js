import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, default: 10 },
  maxDiscount: { type: Number, default: 2000 },
  minBookingAmount: { type: Number, default: 5000 },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
