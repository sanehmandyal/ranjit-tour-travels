import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  featuredImage: { type: String, default: '' },
  features: [{ type: String }],
  benefits: [{ type: String }],
  faqs: [{
    q: { type: String },
    a: { type: String }
  }],
  category: { type: String, default: 'Taxi' },
  published: { type: Boolean, default: true },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
