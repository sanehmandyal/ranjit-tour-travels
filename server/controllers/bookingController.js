import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';

export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = req.query.q || '';
    const status = req.query.status || '';

    const filter = {};
    if (q) {
      filter.$or = [
        { bookingId: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const items = await Booking.find(filter)
      .populate('packageRef', 'name price duration')
      .populate('vehicleRef', 'name category seats')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ bookingId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    }).populate('packageRef').populate('vehicleRef');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { name, phone, email, destination, package: pkg, vehicle, travelDate, returnDate, travelers, pickup, drop, tripType, budget, hotelPreference, specialRequirements, message } = req.body;

    if (!name || !phone || !travelDate) {
      return res.status(400).json({ success: false, message: 'Please provide full name, phone number, and travel date.' });
    }

    // Generate unique sequential Booking ID
    const year = new Date().getFullYear();
    const count = await Booking.countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingId = `RJT-${year}-${seq}`;

    const booking = await Booking.create({
      bookingId,
      name,
      phone,
      email,
      destination,
      package: pkg,
      vehicle,
      travelDate,
      returnDate,
      travelers: Number(travelers) || 2,
      pickup,
      drop,
      tripType: tripType || 'Tour Package',
      budget,
      hotelPreference,
      specialRequirements,
      message,
      ipAddress: req.ip || ''
    });

    // Auto update/create Customer profile for CRM
    try {
      await Customer.findOneAndUpdate(
        { phone },
        { 
          $set: { name, email, city: pickup || '' },
          $inc: { totalTrips: 1 }
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error('Customer sync error:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking request received successfully!',
      bookingId: booking.bookingId,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, message: 'Booking removed successfully.' });
  } catch (err) {
    next(err);
  }
};
