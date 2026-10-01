import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'Landscapes' }, // Landscapes, Fleet, Heritage, Mountains, Temples
  location: { type: String, default: '' },
  alt: { type: String, default: '' },
  published: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
