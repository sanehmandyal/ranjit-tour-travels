import Destination from '../models/Destination.js';
import slugify from 'slugify';

export const getDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const q = req.query.q || '';
    const state = req.query.state || '';
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: true };

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
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const getDestinationBySlug = async (req, res, next) => {
  try {
    const destination = await Destination.findOne({ 
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }] 
    });
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
      data.slug = `${data.slug}-${Date.now()}`;
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
    const destination = await Destination.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json({ success: true, message: 'Destination deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
