import TourPackage from '../models/TourPackage.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

export const getPackages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const destination = req.query.destination || '';
    const category = req.query.category || '';
    const duration = req.query.duration || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    let items = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
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

        total = await TourPackage.countDocuments(filter);
        items = await TourPackage.find(filter)
          .populate('destination', 'name state')
          .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] Packages from localStore:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      let storeItems = localStore.getCollection('packages');
      if (q) {
        const qLow = q.toLowerCase();
        storeItems = storeItems.filter(p => 
          (p.name && p.name.toLowerCase().includes(qLow)) ||
          (p.category && p.category.toLowerCase().includes(qLow)) ||
          (p.overview && p.overview.toLowerCase().includes(qLow))
        );
      }
      if (category) {
        storeItems = storeItems.filter(p => p.category === category);
      }
      items = storeItems.slice((page - 1) * limit, page * limit);
      total = storeItems.length;
    }

    return res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const storeItems = localStore.getCollection('packages');
    return res.json({
      success: true,
      items: storeItems,
      total: storeItems.length,
      page: 1,
      pages: 1
    });
  }
};

export const getPackageBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let pkg = null;
    if (mongoose.connection.readyState === 1) {
      try {
        pkg = await TourPackage.findOne(query).populate('destination');
        if (!pkg && !isObjectId) {
          pkg = await TourPackage.findOne({
            $or: [
              { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
              { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
            ]
          }).populate('destination');
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] Package by slug:', dbErr.message);
      }
    }

    if (!pkg) {
      pkg = localStore.getItem('packages', rawSlug);
    }

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    return res.json(pkg);
  } catch (err) {
    const pkg = localStore.getItem('packages', req.params.slug);
    if (pkg) return res.json(pkg);
    return res.status(404).json({ success: false, message: 'Package not found.' });
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

    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || (data.gallery && data.gallery[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      if (!data.gallery || data.gallery.length === 0) {
        data.gallery = (data.images && data.images.length > 0) ? data.images : [photo];
      }
    }

    let saved = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const matchCriteria = [];
        if (data.slug) matchCriteria.push({ slug: data.slug });
        if (data.name) matchCriteria.push({ name: data.name });

        let exists = null;
        if (matchCriteria.length > 0) {
          exists = await TourPackage.findOne({ $or: matchCriteria });
        }

        if (exists) {
          saved = await TourPackage.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
        } else {
          saved = await TourPackage.create(data);
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] createPackage:', dbErr.message);
      }
    }

    const finalItem = localStore.upsertItem('packages', saved?.toObject ? saved.toObject() : data);
    return res.status(201).json({ success: true, data: saved?.toObject ? saved.toObject() : finalItem });
  } catch (err) {
    console.error('[createPackage Error]:', err);
    const finalItem = localStore.upsertItem('packages', req.body);
    return res.status(201).json({ success: true, data: finalItem });
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

    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || (data.gallery && data.gallery[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      if (!data.gallery || data.gallery.length === 0) {
        data.gallery = (data.images && data.images.length > 0) ? data.images : [photo];
      }
    }

    let pkg = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          pkg = await TourPackage.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: false });
        }

        if (!pkg) {
          const matchCriteria = [];
          if (data.slug) matchCriteria.push({ slug: data.slug });
          if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
          if (data.name) matchCriteria.push({ name: data.name });

          if (matchCriteria.length > 0) {
            const existing = await TourPackage.findOne({ $or: matchCriteria });
            if (existing) {
              pkg = await TourPackage.findByIdAndUpdate(existing._id, { $set: data }, { new: true, runValidators: false });
            } else {
              pkg = await TourPackage.create({
                slug: data.slug || req.params.id,
                ...data
              });
            }
          } else {
            pkg = await TourPackage.create(data);
          }
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] updatePackage:', dbErr.message);
      }
    }

    const payloadWithId = { ...data, _id: pkg?._id ? pkg._id.toString() : req.params.id };
    const finalItem = localStore.upsertItem('packages', pkg?.toObject ? pkg.toObject() : payloadWithId);
    return res.json({ success: true, data: pkg?.toObject ? pkg.toObject() : finalItem });
  } catch (err) {
    console.error('[updatePackage Error]:', err);
    const finalItem = localStore.upsertItem('packages', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: finalItem });
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          await TourPackage.findByIdAndDelete(req.params.id);
        } else {
          await TourPackage.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] deletePackage:', dbErr.message);
      }
    }
    localStore.deleteItem('packages', req.params.id);
    return res.json({ success: true, message: 'Tour package deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('packages', req.params.id);
    return res.json({ success: true, message: 'Tour package deleted successfully.' });
  }
};
