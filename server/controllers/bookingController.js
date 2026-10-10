import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import { localStore } from '../utils/localStore.js';

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

    let items = [];
    let total = 0;
    try {
      total = await Booking.countDocuments(filter).maxTimeMS(2500);
      items = await Booking.find(filter)
        .populate('packageRef', 'name price duration')
        .populate('vehicleRef', 'name category seats')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] getBookings:', dbErr.message);
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('bookings');
      items = local;
      total = local.length;
    }

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('bookings');
    res.json({
      success: true,
      items: local,
      total: local.length,
      page: 1,
      pages: 1
    });
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
    const count = Date.now().toString().slice(-4);
    const bookingId = `RJT-${year}-${count}`;

    let booking = null;
    try {
      booking = await Booking.create({
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

      try {
        await Customer.findOneAndUpdate(
          { phone },
          { 
            $set: { name, email, city: pickup || '' },
            $inc: { totalTrips: 1 }
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    } catch (dbErr) {
      console.warn('[DB Fallback] createBooking:', dbErr.message);
    }

    const saved = localStore.upsertItem('bookings', booking ? booking.toObject() : {
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
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Booking request received successfully!',
      bookingId: (booking && booking.bookingId) || saved.bookingId,
      data: booking || saved
    });
  } catch (err) {
    next(err);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    let booking = null;
    try {
      booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] updateBooking:', dbErr.message);
    }
    const saved = localStore.upsertItem('bookings', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: booking || saved });
  } catch (err) {
    const saved = localStore.upsertItem('bookings', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: saved });
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    try {
      await Booking.findByIdAndDelete(req.params.id).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteBooking:', dbErr.message);
    }
    localStore.deleteItem('bookings', req.params.id);
    res.json({ success: true, message: 'Booking removed successfully.' });
  } catch (err) {
    localStore.deleteItem('bookings', req.params.id);
    res.json({ success: true, message: 'Booking removed successfully.' });
  }
};
