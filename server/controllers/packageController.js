import TourPackage from '../models/TourPackage.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

export const getPackages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const destination = req.query.destination || '';
    const category = req.query.category || '';
    const duration = req.query.duration || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { overview: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    if (destination) filter.destination = destination;
    if (category) filter.category = category;
    if (duration) filter.duration = duration;

    const total = await TourPackage.countDocuments(filter);
    const items = await TourPackage.find(filter)
      .populate('destination', 'name state')
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
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

export const getPackageBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let pkg = await TourPackage.findOne(query).populate('destination');
    if (!pkg && !isObjectId) {
      pkg = await TourPackage.findOne({
        $or: [
          { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
          { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
        ]
      }).populate('destination');
    }
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json(pkg);
  } catch (err) {
    next(err);
  }
};


export const createPackage = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const matchCriteria = [];
    if (data.slug) matchCriteria.push({ slug: data.slug });
    if (data.name) matchCriteria.push({ name: data.name });

    let exists = null;
    if (matchCriteria.length > 0) {
      exists = await TourPackage.findOne({ $or: matchCriteria });
    }

    if (exists) {
      const updated = await TourPackage.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
      return res.status(200).json({ success: true, data: updated });
    }
    const pkg = await TourPackage.create(data);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    let pkg = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (isObjectId) {
      pkg = await TourPackage.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
    }

    if (!pkg) {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
      if (data.name) matchCriteria.push({ name: data.name });

      if (matchCriteria.length > 0) {
        pkg = await TourPackage.findOneAndUpdate(
          { $or: matchCriteria },
          { $set: data },
          { new: true, upsert: true, runValidators: false }
        );
      } else {
        pkg = await TourPackage.create(data);
      }
    }

    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    let pkg = null;
    if (isObjectId) {
      pkg = await TourPackage.findByIdAndDelete(req.params.id);
    } else {
      pkg = await TourPackage.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
    }
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, message: 'Tour package deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
