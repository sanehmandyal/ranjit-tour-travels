import Gallery from '../models/Gallery.js';
import { localStore } from '../utils/localStore.js';

export const getGallery = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: true };

    const filter = { ...publishedOnly };
    if (category) filter.category = category;

    let items = [];
    let total = 0;
    try {
      total = await Gallery.countDocuments(filter).maxTimeMS(2500);
      items = await Gallery.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] getGallery:', dbErr.message);
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('gallery');
      items = category ? local.filter(g => (g.category || '').toLowerCase() === category.toLowerCase()) : local;
      total = items.length;
    }

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('gallery');
    res.json({
      success: true,
      items: local,
      total: local.length,
      page: 1,
      pages: 1
    });
  }
};

export const createGalleryItem = async (req, res, next) => {
  try {
    let item = null;
    try {
      item = await Gallery.create(req.body);
    } catch (dbErr) {
      console.warn('[DB Fallback] createGalleryItem:', dbErr.message);
    }
    const saved = localStore.upsertItem('gallery', item ? item.toObject() : req.body);
    res.status(201).json({ success: true, data: item || saved });
  } catch (err) {
    const saved = localStore.upsertItem('gallery', req.body);
    res.status(201).json({ success: true, data: saved });
  }
};

export const updateGalleryItem = async (req, res, next) => {
  try {
    let item = null;
    try {
      item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] updateGalleryItem:', dbErr.message);
    }
    const saved = localStore.upsertItem('gallery', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: item || saved });
  } catch (err) {
    const saved = localStore.upsertItem('gallery', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: saved });
  }
};

export const deleteGalleryItem = async (req, res, next) => {
  try {
    try {
      await Gallery.findByIdAndDelete(req.params.id).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteGalleryItem:', dbErr.message);
    }
    localStore.deleteItem('gallery', req.params.id);
    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err) {
    localStore.deleteItem('gallery', req.params.id);
    res.json({ success: true, message: 'Gallery item deleted.' });
  }
};
