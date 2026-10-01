import TourPackage from '../models/TourPackage.js';
import slugify from 'slugify';

export const getPackages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const q = req.query.q || '';
    const category = req.query.category || '';
    const destination = req.query.destination || '';
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const publishedOnly = req.query.admin ? {} : { published: true };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { overview: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (destination) filter.destination = destination;
    if (maxPrice) filter.price = { $lte: maxPrice };

    const total = await TourPackage.countDocuments(filter);
    const items = await TourPackage.find(filter)
      .populate('destination', 'name slug state')
      .sort({ isFeatured: -1, createdAt: -1 })
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

export const getPackageBySlug = async (req, res, next) => {
  try {
    const pkg = await TourPackage.findOne({ 
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }] 
    }).populate('destination');
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
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const exists = await TourPackage.findOne({ slug: data.slug });
    if (exists) {
      data.slug = `${data.slug}-${Date.now()}`;
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
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const pkg = await TourPackage.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const pkg = await TourPackage.findByIdAndDelete(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    res.json({ success: true, message: 'Tour package deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
