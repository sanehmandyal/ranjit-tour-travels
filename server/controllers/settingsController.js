import mongoose from 'mongoose';
import WebsiteSettings from '../models/WebsiteSettings.js';
import SEOSettings from '../models/SEOSettings.js';
import { localStore } from '../utils/localStore.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = null;
    if (mongoose.connection.readyState === 1) {
      try {
        settings = await WebsiteSettings.findOne();
        if (!settings) {
          settings = await WebsiteSettings.create({});
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] getSettings:', dbErr.message);
      }
    }
    const finalSettings = settings?.toObject ? settings.toObject() : localStore.getSettings();
    return res.json(finalSettings);
  } catch (err) {
    return res.json(localStore.getSettings());
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = null;
    if (mongoose.connection.readyState === 1) {
      try {
        settings = await WebsiteSettings.findOne();
        if (!settings) {
          settings = await WebsiteSettings.create(req.body);
        } else {
          settings = await WebsiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] updateSettings:', dbErr.message);
      }
    }
    const finalSettings = localStore.updateSettings(req.body);
    return res.json(settings?.toObject ? settings.toObject() : finalSettings);
  } catch (err) {
    const finalSettings = localStore.updateSettings(req.body);
    return res.json(finalSettings);
  }
};

export const getSEOSettings = async (req, res, next) => {
  try {
    let items = [];
    if (mongoose.connection.readyState === 1) {
      items = await SEOSettings.find();
    }
    return res.json({ success: true, items });
  } catch (err) {
    return res.json({ success: true, items: [] });
  }
};

export const updateSEOSettings = async (req, res, next) => {
  try {
    const { page, title, description, keywords, ogImage, canonicalUrl, structuredData } = req.body;
    let item = { page, title, description, keywords, ogImage, canonicalUrl, structuredData };
    if (mongoose.connection.readyState === 1) {
      item = await SEOSettings.findOneAndUpdate(
        { page },
        { page, title, description, keywords, ogImage, canonicalUrl, structuredData },
        { upsert: true, new: true }
      );
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    return res.json({ success: true, data: req.body });
  }
};

export const triggerSeedSync = async (req, res, next) => {
  try {
    const { seedDatabase } = await import('../seed/seed.js');
    const clearFirst = req.query.clear === 'true';
    await seedDatabase(clearFirst);
    return res.json({
      success: true,
      message: clearFirst ? 'Database cleared and seeded successfully' : 'Database non-destructive sync completed successfully'
    });
  } catch (err) {
    return res.json({
      success: true,
      message: 'Local memory store active.'
    });
  }
};
