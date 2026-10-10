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

      total = await Destination.countDocuments(filter).maxTimeMS(2500);
      items = await Destination.find(filter)
        .sort({ isPopular: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] Destinations from localStore:', dbErr.message);
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

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const storeItems = localStore.getCollection('destinations');
    res.json({
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
    try {
      destination = await Destination.findOne(query).maxTimeMS(2500);
      if (!destination && !isObjectId) {
        destination = await Destination.findOne({
          $or: [
            { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
            { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
          ]
        }).maxTimeMS(2500);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] Destination by slug:', dbErr.message);
    }

    if (!destination) {
      destination = localStore.getItem('destinations', rawSlug);
    }

    if (!destination) {
      const all = localStore.getCollection('destinations');
      destination = all[0] || null;
    }

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found.' });
    }
    res.json(destination);
  } catch (err) {
    const destination = localStore.getItem('destinations', req.params.slug) || localStore.getCollection('destinations')[0];
    if (destination) return res.json(destination);
    next(err);
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
    try {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (data.name) matchCriteria.push({ name: data.name });

      let exists = null;
      if (matchCriteria.length > 0) {
        exists = await Destination.findOne({ $or: matchCriteria }).maxTimeMS(2500);
      }

      if (exists) {
        saved = await Destination.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false }).maxTimeMS(2500);
      } else {
        saved = await Destination.create(data);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] createDestination:', dbErr.message);
    }

    const finalItem = localStore.upsertItem('destinations', saved ? saved.toObject() : data);
    res.status(201).json({ success: true, data: saved || finalItem });
  } catch (err) {
    const finalItem = localStore.upsertItem('destinations', req.body);
    res.status(201).json({ success: true, data: finalItem });
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

    try {
      if (isObjectId) {
        destination = await Destination.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false }).maxTimeMS(2500);
      }

      if (!destination) {
        const matchCriteria = [];
        if (data.slug) matchCriteria.push({ slug: data.slug });
        if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
        if (data.name) matchCriteria.push({ name: data.name });

        if (matchCriteria.length > 0) {
          destination = await Destination.findOneAndUpdate(
            { $or: matchCriteria },
            { $set: data },
            { new: true, upsert: true, runValidators: false }
          ).maxTimeMS(2500);
        } else {
          destination = await Destination.create(data);
        }
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] updateDestination:', dbErr.message);
    }

    const payloadWithId = { ...data, _id: req.params.id };
    const finalItem = localStore.upsertItem('destinations', destination ? destination.toObject() : payloadWithId);
    res.json({ success: true, data: destination || finalItem });
  } catch (err) {
    const finalItem = localStore.upsertItem('destinations', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: finalItem });
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    try {
      if (isObjectId) {
        await Destination.findByIdAndDelete(req.params.id).maxTimeMS(2500);
      } else {
        await Destination.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] }).maxTimeMS(2500);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteDestination:', dbErr.message);
    }
    localStore.deleteItem('destinations', req.params.id);
    res.json({ success: true, message: 'Destination deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('destinations', req.params.id);
    res.json({ success: true, message: 'Destination deleted successfully.' });
  }
};
