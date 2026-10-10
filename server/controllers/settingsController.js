import WebsiteSettings from '../models/WebsiteSettings.js';
import SEOSettings from '../models/SEOSettings.js';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create(req.body);
    } else {
      settings = await WebsiteSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

export const getSEOSettings = async (req, res, next) => {
  try {
    const items = await SEOSettings.find();
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const updateSEOSettings = async (req, res, next) => {
  try {
    const { page, title, description, keywords, ogImage, canonicalUrl, structuredData } = req.body;
    const item = await SEOSettings.findOneAndUpdate(
      { page },
      { page, title, description, keywords, ogImage, canonicalUrl, structuredData },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const triggerSeedSync = async (req, res, next) => {
  try {
    const { seedDatabase } = await import('../seed/seed.js');
    const clearFirst = req.query.clear === 'true';
    await seedDatabase(clearFirst);
    res.json({
      success: true,
      message: clearFirst ? 'Database cleared and seeded successfully' : 'Database non-destructive sync completed successfully'
    });
  } catch (err) {
    next(err);
  }
};

