import Service from '../models/Service.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

export const getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const publishedOnly = req.query.admin ? {} : { published: { $ne: false } };

    let items = [];
    let total = 0;

    try {
      const filter = { ...publishedOnly };
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      total = await Service.countDocuments(filter).maxTimeMS(2500);
      items = await Service.find(filter)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] Services from localStore:', dbErr.message);
    }

    if (!items || items.length === 0) {
      let storeItems = localStore.getCollection('services');
      if (q) {
        const qLow = q.toLowerCase();
        storeItems = storeItems.filter(s => 
          (s.name && s.name.toLowerCase().includes(qLow)) ||
          (s.shortDescription && s.shortDescription.toLowerCase().includes(qLow))
        );
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
    const storeItems = localStore.getCollection('services');
    res.json({
      success: true,
      items: storeItems,
      total: storeItems.length,
      page: 1,
      pages: 1
    });
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let service = null;
    try {
      service = await Service.findOne(query).maxTimeMS(2500);
      if (!service && !isObjectId) {
        service = await Service.findOne({
          $or: [
            { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
            { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
          ]
        }).maxTimeMS(2500);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] Service by slug:', dbErr.message);
    }

    if (!service) {
      service = localStore.getItem('services', rawSlug);
    }

    if (!service) {
      const all = localStore.getCollection('services');
      service = all[0] || null;
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    res.json(service);
  } catch (err) {
    const service = localStore.getItem('services', req.params.slug) || localStore.getCollection('services')[0];
    if (service) return res.json(service);
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

    let saved = null;
    try {
      const matchCriteria = [];
      if (data.slug) matchCriteria.push({ slug: data.slug });
      if (data.name) matchCriteria.push({ name: data.name });

      let exists = null;
      if (matchCriteria.length > 0) {
        exists = await Service.findOne({ $or: matchCriteria }).maxTimeMS(2500);
      }

      if (exists) {
        saved = await Service.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false }).maxTimeMS(2500);
      } else {
        saved = await Service.create(data);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] createService:', dbErr.message);
    }

    const finalItem = localStore.upsertItem('services', saved ? saved.toObject() : data);
    res.status(201).json({ success: true, data: saved || finalItem });
  } catch (err) {
    const finalItem = localStore.upsertItem('services', req.body);
    res.status(201).json({ success: true, data: finalItem });
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

    try {
      if (isObjectId) {
        service = await Service.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false }).maxTimeMS(2500);
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
          ).maxTimeMS(2500);
        } else {
          service = await Service.create(data);
        }
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] updateService:', dbErr.message);
    }

    const payloadWithId = { ...data, _id: req.params.id };
    const finalItem = localStore.upsertItem('services', service ? service.toObject() : payloadWithId);
    res.json({ success: true, data: service || finalItem });
  } catch (err) {
    const finalItem = localStore.upsertItem('services', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: finalItem });
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    try {
      if (isObjectId) {
        await Service.findByIdAndDelete(req.params.id).maxTimeMS(2500);
      } else {
        await Service.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] }).maxTimeMS(2500);
      }
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteService:', dbErr.message);
    }
    localStore.deleteItem('services', req.params.id);
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('services', req.params.id);
    res.json({ success: true, message: 'Service deleted successfully.' });
  }
};
