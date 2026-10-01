import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true },
  type: { type: String, enum: ['contact', 'custom_trip', 'general', 'corporate'], default: 'contact' },
  subject: { type: String, default: '' },
  destination: { type: String, default: '' },
  travelers: { type: Number, default: 2 },
  travelDate: { type: String, default: '' },
  budget: { type: String, default: '' },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'Contacted', 'Closed'], default: 'New' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
