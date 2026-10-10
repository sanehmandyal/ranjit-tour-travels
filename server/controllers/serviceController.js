import Service from '../models/Service.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

export const getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const total = await Service.countDocuments(filter);
    const items = await Service.find(filter)
      .sort({ createdAt: 1 })
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

export const getServiceBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let service = await Service.findOne(query);
    if (!service && !isObjectId) {
      service = await Service.findOne({
        $or: [
          { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
          { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
        ]
      });
    }
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json(service);
  } catch (err) {
    next(err);
  }
};


export const createService = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.published === undefined) data.published = true;
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

    const matchCriteria = [];
    if (data.slug) matchCriteria.push({ slug: data.slug });
    if (data.name) matchCriteria.push({ name: data.name });

    let exists = null;
    if (matchCriteria.length > 0) {
      exists = await Service.findOne({ $or: matchCriteria });
    }

    if (exists) {
      const updated = await Service.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
      return res.status(200).json({ success: true, data: updated });
    }
    const service = await Service.create(data);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.published === undefined) data.published = true;
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

    let service = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (isObjectId) {
      service = await Service.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
    }

    if (!service) {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
      if (data.name) matchCriteria.push({ name: data.name });

      if (matchCriteria.length > 0) {
        service = await Service.findOneAndUpdate(
          { $or: matchCriteria },
          { $set: data },
          { new: true, upsert: true, runValidators: false }
        );
      } else {
        service = await Service.create(data);
      }
    }

    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    let service = null;
    if (isObjectId) {
      service = await Service.findByIdAndDelete(req.params.id);
    } else {
      service = await Service.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
    }
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
