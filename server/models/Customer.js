import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  city: { type: String, default: '' },
  totalTrips: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  tags: [{ type: String }],
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
