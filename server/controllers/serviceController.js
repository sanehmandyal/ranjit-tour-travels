import Service from '../models/Service.js';
import slugify from 'slugify';

export const getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const q = req.query.q || '';
    const publishedOnly = req.query.admin ? {} : { published: true };

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
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ 
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }] 
    });
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
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const exists = await Service.findOne({ slug: data.slug });
    if (exists) {
      data.slug = `${data.slug}-${Date.now()}`;
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
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const service = await Service.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
