import Inquiry from '../models/Inquiry.js';

export const getInquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = req.query.q || '';
    const type = req.query.type || '';

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }
      ];
    }
    if (type) filter.type = type;

    const total = await Inquiry.countDocuments(filter);
    const items = await Inquiry.find(filter)
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

export const createInquiry = async (req, res, next) => {
  try {
    const { name, phone, email, type, subject, destination, travelers, travelDate, budget, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone number, and message.' });
    }
    const inquiry = await Inquiry.create({
      name,
      phone,
      email,
      type: type || 'contact',
      subject,
      destination,
      travelers: Number(travelers) || 2,
      travelDate,
      budget,
      message
    });
    res.status(201).json({ success: true, message: 'Inquiry received. Our travel expert will call you shortly.', data: inquiry });
  } catch (err) {
    next(err);
  }
};

export const updateInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    res.json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
