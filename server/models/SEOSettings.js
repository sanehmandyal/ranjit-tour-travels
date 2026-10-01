import mongoose from 'mongoose';

const seoSettingsSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true }, // e.g. 'home', 'destinations', 'packages', 'cars', 'services', 'about', 'contact', 'gallery', 'blog'
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [{ type: String }],
  ogImage: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  structuredData: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('SEOSettings', seoSettingsSchema);
