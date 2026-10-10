import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial.js';
import { localStore } from '../utils/localStore.js';

export const getTestimonials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const publishedOnly = req.query.admin ? {} : { published: true };

    let items = [];
    let total = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        total = await Testimonial.countDocuments(publishedOnly);
        items = await Testimonial.find(publishedOnly)
          .sort({ rating: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] getTestimonials:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('testimonials');
      items = req.query.admin ? local : local.filter(t => t.published !== false);
      total = items.length;
    }

    return res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('testimonials');
    return res.json({
      success: true,
      items: local,
      total: local.length,
      page: 1,
      pages: 1
    });
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    let testimonial = null;
    if (mongoose.connection.readyState === 1) {
      try {
        testimonial = await Testimonial.create(req.body);
      } catch (dbErr) {
        console.warn('[DB Fallback] createTestimonial:', dbErr.message);
      }
    }
    const saved = localStore.upsertItem('testimonials', testimonial?.toObject ? testimonial.toObject() : req.body);
    return res.status(201).json({ success: true, data: testimonial || saved });
  } catch (err) {
    const saved = localStore.upsertItem('testimonials', req.body);
    return res.status(201).json({ success: true, data: saved });
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    let testimonial = null;
    if (mongoose.connection.readyState === 1) {
      try {
        testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
      } catch (dbErr) {
        console.warn('[DB Fallback] updateTestimonial:', dbErr.message);
      }
    }
    const saved = localStore.upsertItem('testimonials', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: testimonial || saved });
  } catch (err) {
    const saved = localStore.upsertItem('testimonials', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: saved });
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        await Testimonial.findByIdAndDelete(req.params.id);
      } catch (dbErr) {
        console.warn('[DB Fallback] deleteTestimonial:', dbErr.message);
      }
    }
    localStore.deleteItem('testimonials', req.params.id);
    return res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('testimonials', req.params.id);
    return res.json({ success: true, message: 'Testimonial deleted successfully.' });
  }
};
