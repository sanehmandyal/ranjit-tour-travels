import Destination from '../models/Destination.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

export const getDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const state = req.query.state || '';
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    let items = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
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

        total = await Destination.countDocuments(filter);
        items = await Destination.find(filter)
          .sort({ isPopular: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] Destinations from localStore:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      let storeItems = localStore.getCollection('destinations');
      if (q) {
        const qLow = q.toLowerCase();
        storeItems = storeItems.filter(d => 
          (d.name && d.name.toLowerCase().includes(qLow)) ||
          (d.state && d.state.toLowerCase().includes(qLow)) ||
          (d.category && d.category.toLowerCase().includes(qLow))
        );
      }
      if (state) {
        storeItems = storeItems.filter(d => d.state === state);
      }
      if (category) {
        storeItems = storeItems.filter(d => d.category === category);
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
    const storeItems = localStore.getCollection('destinations');
    return res.json({
      success: true,
      items: storeItems,
      total: storeItems.length,
      page: 1,
      pages: 1
    });
  }
};

export const getDestinationBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let destination = null;
    if (mongoose.connection.readyState === 1) {
      try {
        destination = await Destination.findOne(query);
        if (!destination && !isObjectId) {
          const escapedSlug = rawSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          destination = await Destination.findOne({
            $or: [
              { slug: { $regex: `^${escapedSlug}$`, $options: 'i' } },
              { name: { $regex: escapedSlug.replace(/-/g, ' '), $options: 'i' } }
            ]
          });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] Destination by slug:', dbErr.message);
      }
    }

    if (!destination) {
      destination = localStore.getItem('destinations', rawSlug);
    }

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    return res.json(destination);
  } catch (err) {
    const destination = localStore.getItem('destinations', req.params.slug);
    if (destination) return res.json(destination);
    return res.status(404).json({ success: false, message: 'Destination not found.' });
  }
};

export const createDestination = async (req, res, next) => {
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
          exists = await Destination.findOne({ $or: matchCriteria });
        }

        if (exists) {
          saved = await Destination.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
        } else {
          saved = await Destination.create(data);
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] createDestination:', dbErr.message);
      }
    }

    const finalItem = localStore.upsertItem('destinations', saved?.toObject ? saved.toObject() : data);
    return res.status(201).json({ success: true, data: saved?.toObject ? saved.toObject() : finalItem });
  } catch (err) {
    console.error('[createDestination Error]:', err);
    const finalItem = localStore.upsertItem('destinations', req.body);
    return res.status(201).json({ success: true, data: finalItem });
  }
};

export const updateDestination = async (req, res, next) => {
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

    let destination = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          destination = await Destination.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: false });
        }

        if (!destination) {
          const matchCriteria = [];
          if (data.slug) matchCriteria.push({ slug: data.slug });
          if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
          if (data.name) matchCriteria.push({ name: data.name });

          if (matchCriteria.length > 0) {
            const existing = await Destination.findOne({ $or: matchCriteria });
            if (existing) {
              destination = await Destination.findByIdAndUpdate(existing._id, { $set: data }, { new: true, runValidators: false });
            } else {
              destination = await Destination.create({
                slug: data.slug || req.params.id,
                ...data
              });
            }
          } else {
            destination = await Destination.create(data);
          }
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] updateDestination:', dbErr.message);
      }
    }

    const payloadWithId = { ...data, _id: destination?._id ? destination._id.toString() : req.params.id };
    const finalItem = localStore.upsertItem('destinations', destination?.toObject ? destination.toObject() : payloadWithId);
    return res.json({ success: true, data: destination?.toObject ? destination.toObject() : finalItem });
  } catch (err) {
    console.error('[updateDestination Error]:', err);
    const finalItem = localStore.upsertItem('destinations', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: finalItem });
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          await Destination.findByIdAndDelete(req.params.id);
        } else {
          await Destination.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] deleteDestination:', dbErr.message);
      }
    }
    localStore.deleteItem('destinations', req.params.id);
    return res.json({ success: true, message: 'Destination deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('destinations', req.params.id);
    return res.json({ success: true, message: 'Destination deleted successfully.' });
  }
};
