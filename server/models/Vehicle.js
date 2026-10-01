import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    default: 'SUV' 
  },
  seats: { type: Number, required: true, default: 6 },
  luggage: { type: Number, default: 4 },
  isAc: { type: Boolean, default: true },
  fuel: { type: String, default: 'Diesel / Petrol' },
  transmission: { type: String, default: 'Manual / Automatic' },
  pricePerKm: { type: Number, default: 14 },
  pricePerDay: { type: Number, default: 3500 },
  images: [{ type: String }],
  features: [{ type: String }],
  description: { type: String, default: '' },
  available: { type: Boolean, default: true },
  published: { type: Boolean, default: true },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }
}, { timestamps: true });

vehicleSchema.index({ name: 'text', category: 'text' });

export default mongoose.model('Vehicle', vehicleSchema);
