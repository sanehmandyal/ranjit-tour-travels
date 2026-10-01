import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, default: '' },
  content: { type: String, required: true },
  featuredImage: { type: String, default: '' },
  author: { type: String, default: 'Ranjit Tour & Travels Editorial' },
  category: { type: String, default: 'Travel Guide' },
  tags: [{ type: String }],
  readTime: { type: String, default: '5 min read' },
  published: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }]
  }
}, { timestamps: true });

blogSchema.index({ title: 'text', content: 'text', excerpt: 'text', category: 'text' });

export default mongoose.model('Blog', blogSchema);
