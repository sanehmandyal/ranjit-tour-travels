import Vehicle from '../models/Vehicle.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

export const getVehicles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    const total = await Vehicle.countDocuments(filter);
    const items = await Vehicle.find(filter)
      .sort({ seats: 1, createdAt: -1 })
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

export const getVehicleBySlug = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug) && req.params.slug.length === 24;
    const query = isObjectId 
      ? { $or: [{ _id: req.params.slug }, { slug: req.params.slug }] }
      : { slug: req.params.slug };
    
    const vehicle = await Vehicle.findOne(query);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.published === undefined) data.published = true;
    if (data.available === undefined) data.available = true;
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    // Sync all image fields
    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      data.image = photo;
      if (!data.images || data.images.length === 0) {
        data.images = [photo];
      }
    }

    const exists = await Vehicle.findOne({ $or: [{ slug: data.slug }, { name: data.name }] });
    if (exists) {
      const updated = await Vehicle.findByIdAndUpdate(exists._id, data, { new: true });
      return res.status(200).json({ success: true, data: updated });
    }
    const vehicle = await Vehicle.create(data);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.published === undefined) data.published = true;
    if (data.available === undefined) data.available = true;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    // Sync all image fields
    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      data.image = photo;
      if (!data.images || data.images.length === 0) {
        data.images = [photo];
      }
    }

    let vehicle = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (isObjectId) {
      vehicle = await Vehicle.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
    }

    if (!vehicle) {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (req.params.id) matchCriteria.push({ slug: req.params.id });
      if (data.name) matchCriteria.push({ name: data.name });

      vehicle = await Vehicle.findOneAndUpdate(
        { $or: matchCriteria },
        { $set: data },
        { new: true, upsert: true, runValidators: false }
      );
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    let vehicle = null;
    if (isObjectId) {
      vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    } else {
      vehicle = await Vehicle.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
    }
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
