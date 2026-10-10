import Testimonial from '../models/Testimonial.js';
import { localStore } from '../utils/localStore.js';

export const getTestimonials = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const publishedOnly = req.query.admin ? {} : { published: true };

    let items = [];
    let total = 0;
    try {
      total = await Testimonial.countDocuments(publishedOnly).maxTimeMS(2500);
      items = await Testimonial.find(publishedOnly)
        .sort({ rating: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] getTestimonials:', dbErr.message);
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('testimonials');
      items = req.query.admin ? local : local.filter(t => t.published !== false);
      total = items.length;
    }

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('testimonials');
    res.json({
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
    try {
      testimonial = await Testimonial.create(req.body);
    } catch (dbErr) {
      console.warn('[DB Fallback] createTestimonial:', dbErr.message);
    }
    const saved = localStore.upsertItem('testimonials', testimonial ? testimonial.toObject() : req.body);
    res.status(201).json({ success: true, data: testimonial || saved });
  } catch (err) {
    const saved = localStore.upsertItem('testimonials', req.body);
    res.status(201).json({ success: true, data: saved });
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    let testimonial = null;
    try {
      testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] updateTestimonial:', dbErr.message);
    }
    const saved = localStore.upsertItem('testimonials', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: testimonial || saved });
  } catch (err) {
    const saved = localStore.upsertItem('testimonials', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: saved });
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    try {
      await Testimonial.findByIdAndDelete(req.params.id).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteTestimonial:', dbErr.message);
    }
    localStore.deleteItem('testimonials', req.params.id);
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('testimonials', req.params.id);
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  }
};
