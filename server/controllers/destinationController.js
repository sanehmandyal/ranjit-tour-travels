import Destination from '../models/Destination.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

export const getDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const state = req.query.state || '';
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (state) filter.state = state;
    if (category) filter.category = category;

    const total = await Destination.countDocuments(filter);
    const items = await Destination.find(filter)
      .sort({ isPopular: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    next(err);
  }
};

export const getDestinationBySlug = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug) && req.params.slug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: req.params.slug }, { slug: req.params.slug }] }
      : { slug: req.params.slug };

    const destination = await Destination.findOne(query);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json(destination);
  } catch (err) {
    next(err);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const exists = await Destination.findOne({ slug: data.slug });
    if (exists) {
      const updated = await Destination.findByIdAndUpdate(exists._id, data, { new: true });
      return res.status(200).json({ success: true, data: updated });
    }
    const destination = await Destination.create(data);
    res.status(201).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    let destination = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (isObjectId) {
      destination = await Destination.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
    }

    if (!destination) {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (req.params.id) matchCriteria.push({ slug: req.params.id });
      if (data.name) matchCriteria.push({ name: data.name });

      destination = await Destination.findOneAndUpdate(
        { $or: matchCriteria },
        { $set: data },
        { new: true, upsert: true, runValidators: false }
      );
    }

    res.json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    let destination = null;
    if (isObjectId) {
      destination = await Destination.findByIdAndDelete(req.params.id);
    } else {
      destination = await Destination.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
    }
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json({ success: true, message: 'Destination deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
