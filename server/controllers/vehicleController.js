import Vehicle from '../models/Vehicle.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

export const getVehicles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
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
            { category: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ];
        }
        if (category) filter.category = category;

        total = await Vehicle.countDocuments(filter);
        items = await Vehicle.find(filter)
          .sort({ seats: 1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] Vehicles serving from localStore:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      let storeItems = localStore.getCollection('vehicles');
      if (q) {
        const qLow = q.toLowerCase();
        storeItems = storeItems.filter(v => 
          (v.name && v.name.toLowerCase().includes(qLow)) ||
          (v.category && v.category.toLowerCase().includes(qLow))
        );
      }
      if (category) {
        storeItems = storeItems.filter(v => v.category === category);
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
    const storeItems = localStore.getCollection('vehicles');
    return res.json({
      success: true,
      items: storeItems,
      total: storeItems.length,
      page: 1,
      pages: 1
    });
  }
};

export const getVehicleBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId 
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };
    
    let vehicle = null;
    if (mongoose.connection.readyState === 1) {
      try {
        vehicle = await Vehicle.findOne(query);
        if (!vehicle && !isObjectId) {
          vehicle = await Vehicle.findOne({
            $or: [
              { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
              { name: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
            ]
          });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] Vehicle by slug:', dbErr.message);
      }
    }

    if (!vehicle) {
      vehicle = localStore.getItem('vehicles', rawSlug);
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    return res.json(vehicle);
  } catch (err) {
    const vehicle = localStore.getItem('vehicles', req.params.slug);
    if (vehicle) return res.json(vehicle);
    return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (!data.slug && data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      if (!data.images || data.images.length === 0) {
        data.images = [photo];
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
          exists = await Vehicle.findOne({ $or: matchCriteria });
        }

        if (exists) {
          saved = await Vehicle.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
        } else {
          saved = await Vehicle.create(data);
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] createVehicle:', dbErr.message);
      }
    }

    const finalItem = localStore.upsertItem('vehicles', saved?.toObject ? saved.toObject() : data);
    return res.status(201).json({ success: true, data: saved?.toObject ? saved.toObject() : finalItem });
  } catch (err) {
    console.error('[createVehicle Error]:', err);
    const finalItem = localStore.upsertItem('vehicles', req.body);
    return res.status(201).json({ success: true, data: finalItem });
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const photo = data.featuredImage || data.image || (data.images && data.images[0]) || '';
    if (photo) {
      data.featuredImage = photo;
      if (!data.images || data.images.length === 0) {
        data.images = [photo];
      }
    }

    let vehicle = null;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          vehicle = await Vehicle.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
        }

        if (!vehicle) {
          const matchCriteria = [];
          if (data.slug) matchCriteria.push({ slug: data.slug });
          if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
          if (data.name) matchCriteria.push({ name: data.name });

          if (matchCriteria.length > 0) {
            vehicle = await Vehicle.findOneAndUpdate(
              { $or: matchCriteria },
              { $set: data },
              { new: true, upsert: true, runValidators: false }
            );
          } else {
            vehicle = await Vehicle.create(data);
          }
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] updateVehicle:', dbErr.message);
      }
    }

    const payloadWithId = { ...data, _id: req.params.id };
    const finalItem = localStore.upsertItem('vehicles', vehicle?.toObject ? vehicle.toObject() : payloadWithId);
    return res.json({ success: true, data: vehicle?.toObject ? vehicle.toObject() : finalItem });
  } catch (err) {
    console.error('[updateVehicle Error]:', err);
    const finalItem = localStore.upsertItem('vehicles', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: finalItem });
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    if (mongoose.connection.readyState === 1) {
      try {
        if (isObjectId) {
          await Vehicle.findByIdAndDelete(req.params.id);
        } else {
          await Vehicle.findOneAndDelete({ $or: [{ slug: req.params.id }, { name: req.params.id }] });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] deleteVehicle:', dbErr.message);
      }
    }
    localStore.deleteItem('vehicles', req.params.id);
    return res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('vehicles', req.params.id);
    return res.json({ success: true, message: 'Vehicle deleted successfully.' });
  }
};
