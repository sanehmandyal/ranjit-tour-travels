import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  destination: { type: String, default: '' },
  package: { type: String, default: '' },
  image: { type: String, default: '' },
  city: { type: String, default: '' },
  tripDate: { type: String, default: '' },
  published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
