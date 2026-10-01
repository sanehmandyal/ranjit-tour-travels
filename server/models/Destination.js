import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  state: { type: String, required: true, default: 'Himachal Pradesh' },
  country: { type: String, default: 'India' },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  bestTime: { type: String, default: 'Throughout the year' },
  duration: { type: String, default: '3-5 Days' },
  startingPrice: { type: Number, default: 4999 },
  featuredImage: { type: String, default: '' },
  gallery: [{ type: String }],
  attractions: [{ type: String }],
  activities: [{ type: String }],
  faqs: [{
    q: { type: String },
    a: { type: String }
  }],
  category: { type: String, default: 'Hill Station' },
  isPopular: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }]
  }
}, { timestamps: true });

destinationSchema.index({ name: 'text', state: 'text', shortDescription: 'text', description: 'text' });

export default mongoose.model('Destination', destinationSchema);
