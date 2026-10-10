import mongoose from 'mongoose';
import Inquiry from '../models/Inquiry.js';
import { localStore } from '../utils/localStore.js';

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

    let items = [];
    let total = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        total = await Inquiry.countDocuments(filter);
        items = await Inquiry.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] getInquiries:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('inquiries');
      items = local;
      total = local.length;
    }

    return res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('inquiries');
    return res.json({
      success: true,
      items: local,
      total: local.length,
      page: 1,
      pages: 1
    });
  }
};

export const createInquiry = async (req, res, next) => {
  try {
    const { name, phone, email, type, subject, destination, travelers, travelDate, budget, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone number, and message.' });
    }

    let inquiry = null;
    if (mongoose.connection.readyState === 1) {
      try {
        inquiry = await Inquiry.create({
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
      } catch (dbErr) {
        console.warn('[DB Fallback] createInquiry:', dbErr.message);
      }
    }

    const saved = localStore.upsertItem('inquiries', inquiry?.toObject ? inquiry.toObject() : {
      name,
      phone,
      email,
      type: type || 'contact',
      subject,
      destination,
      travelers: Number(travelers) || 2,
      travelDate,
      budget,
      message,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Inquiry received. Our travel expert will call you shortly.', 
      data: inquiry || saved 
    });
  } catch (err) {
    next(err);
  }
};

export const updateInquiry = async (req, res, next) => {
  try {
    let inquiry = null;
    if (mongoose.connection.readyState === 1) {
      try {
        inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } catch (dbErr) {
        console.warn('[DB Fallback] updateInquiry:', dbErr.message);
      }
    }
    const saved = localStore.upsertItem('inquiries', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: inquiry || saved });
  } catch (err) {
    const saved = localStore.upsertItem('inquiries', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: saved });
  }
};

export const deleteInquiry = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        await Inquiry.findByIdAndDelete(req.params.id);
      } catch (dbErr) {
        console.warn('[DB Fallback] deleteInquiry:', dbErr.message);
      }
    }
    localStore.deleteItem('inquiries', req.params.id);
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('inquiries', req.params.id);
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  }
};
