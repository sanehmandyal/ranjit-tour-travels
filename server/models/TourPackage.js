import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, default: 1 },
  title: { type: String, required: true },
  details: { type: String, default: '' },
  meals: { type: String, default: 'Breakfast & Dinner' },
  hotel: { type: String, default: '3-Star / 4-Star Premium Hotel' }
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  duration: { type: String, required: true, default: '4 Nights / 5 Days' },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: 0 },
  featuredImage: { type: String, default: '' },
  gallery: [{ type: String }],
  overview: { type: String, default: '' },
  itinerary: [itinerarySchema],
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  hotel: { type: String, default: 'Handpicked Deluxe & Luxury Stays' },
  transport: { type: String, default: 'Dedicated AC Sanitized Vehicle for entire tour' },
  pickup: { type: String, default: 'Chandigarh / Delhi / Amritsar' },
  drop: { type: String, default: 'Chandigarh / Delhi / Amritsar' },
  category: { type: String, default: 'Family' }, // Family, Honeymoon, Adventure, Spiritual, Group, Weekend
  difficulty: { type: String, default: 'Easy' },
  availableDates: [{ type: String }],
  maxTravelers: { type: Number, default: 20 },
  cancellationPolicy: { type: String, default: 'Free cancellation up to 7 days before departure.' },
  faqs: [{
    q: { type: String },
    a: { type: String }
  }],
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 18 },
  isFeatured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: [{ type: String }]
  }
}, { timestamps: true });

packageSchema.index({ name: 'text', overview: 'text', category: 'text' });

export default mongoose.model('TourPackage', packageSchema);
