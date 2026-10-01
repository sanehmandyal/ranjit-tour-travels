import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  destination: { type: String, default: '' },
  package: { type: String, default: '' },
  packageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage' },
  vehicle: { type: String, default: '' },
  vehicleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  travelDate: { type: String, required: true },
  returnDate: { type: String, default: '' },
  travelers: { type: Number, default: 2 },
  pickup: { type: String, default: '' },
  drop: { type: String, default: '' },
  tripType: { type: String, enum: ['One Way', 'Round Trip', 'Tour Package', 'Custom Journey'], default: 'Tour Package' },
  budget: { type: String, default: '' },
  hotelPreference: { type: String, default: '' },
  activities: [{ type: String }],
  specialRequirements: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  },
  adminNotes: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

bookingSchema.index({ bookingId: 1, name: 1, phone: 1, email: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
