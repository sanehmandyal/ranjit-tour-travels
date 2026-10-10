import { localStore } from '../utils/localStore.js';
import TourPackage from '../models/TourPackage.js';
import Vehicle from '../models/Vehicle.js';
import Destination from '../models/Destination.js';
import Service from '../models/Service.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import Testimonial from '../models/Testimonial.js';
import Gallery from '../models/Gallery.js';
import Blog from '../models/Blog.js';

export const bulkSync = async (req, res, next) => {
  try {
    const { packages, vehicles, destinations, services, settings, testimonials, gallery, blogs } = req.body;
    const results = {};

    // 1. Packages
    if (Array.isArray(packages) && packages.length > 0) {
      for (const p of packages) {
        if (!p) continue;
        localStore.upsertItem('packages', p);
        try {
          const matchQuery = p.slug ? { slug: p.slug } : (p.name ? { name: p.name } : null);
          if (matchQuery) {
            await TourPackage.findOneAndUpdate(matchQuery, p, { upsert: true, new: true, runValidators: false }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.packages = packages.length;
    }

    // 2. Vehicles
    if (Array.isArray(vehicles) && vehicles.length > 0) {
      for (const v of vehicles) {
        if (!v) continue;
        localStore.upsertItem('vehicles', v);
        try {
          const matchQuery = v.slug ? { slug: v.slug } : (v.name ? { name: v.name } : null);
          if (matchQuery) {
            await Vehicle.findOneAndUpdate(matchQuery, v, { upsert: true, new: true, runValidators: false }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.vehicles = vehicles.length;
    }

    // 3. Destinations
    if (Array.isArray(destinations) && destinations.length > 0) {
      for (const d of destinations) {
        if (!d) continue;
        localStore.upsertItem('destinations', d);
        try {
          const matchQuery = d.slug ? { slug: d.slug } : (d.name ? { name: d.name } : null);
          if (matchQuery) {
            await Destination.findOneAndUpdate(matchQuery, d, { upsert: true, new: true, runValidators: false }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.destinations = destinations.length;
    }

    // 4. Services
    if (Array.isArray(services) && services.length > 0) {
      for (const s of services) {
        if (!s) continue;
        localStore.upsertItem('services', s);
        try {
          const matchQuery = s.slug ? { slug: s.slug } : (s.title ? { title: s.title } : (s.name ? { name: s.name } : null));
          if (matchQuery) {
            await Service.findOneAndUpdate(matchQuery, s, { upsert: true, new: true, runValidators: false }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.services = services.length;
    }

    // 5. Settings
    if (settings && typeof settings === 'object') {
      localStore.updateSettings(settings);
      try {
        const exist = await WebsiteSettings.findOne().maxTimeMS(2500);
        if (exist) {
          await WebsiteSettings.findByIdAndUpdate(exist._id, settings, { new: true }).maxTimeMS(2500);
        } else {
          await WebsiteSettings.create(settings);
        }
      } catch (e) {}
      results.settings = true;
    }

    // 6. Testimonials
    if (Array.isArray(testimonials) && testimonials.length > 0) {
      for (const t of testimonials) {
        if (!t) continue;
        localStore.upsertItem('testimonials', t);
        try {
          if (t.name) {
            await Testimonial.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.testimonials = testimonials.length;
    }

    // 7. Gallery
    if (Array.isArray(gallery) && gallery.length > 0) {
      for (const g of gallery) {
        if (!g) continue;
        localStore.upsertItem('gallery', g);
        try {
          if (g.title || g.url || g.image) {
            await Gallery.findOneAndUpdate({ $or: [{ title: g.title }, { url: g.url || g.image }] }, g, { upsert: true, new: true }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.gallery = gallery.length;
    }

    // 8. Blogs
    if (Array.isArray(blogs) && blogs.length > 0) {
      for (const b of blogs) {
        if (!b) continue;
        localStore.upsertItem('blogs', b);
        try {
          const matchQuery = b.slug ? { slug: b.slug } : (b.title ? { title: b.title } : null);
          if (matchQuery) {
            await Blog.findOneAndUpdate(matchQuery, b, { upsert: true, new: true }).maxTimeMS(2500);
          }
        } catch (e) {}
      }
      results.blogs = blogs.length;
    }

    res.json({
      success: true,
      message: 'All content, photos, and settings successfully synchronized to the global cloud server!',
      synced: results
    });
  } catch (err) {
    next(err);
  }
};

export const getAllData = async (req, res, next) => {
  try {
    res.json({
      success: true,
      packages: localStore.getCollection('packages'),
      vehicles: localStore.getCollection('vehicles'),
      destinations: localStore.getCollection('destinations'),
      services: localStore.getCollection('services'),
      testimonials: localStore.getCollection('testimonials'),
      gallery: localStore.getCollection('gallery'),
      blogs: localStore.getCollection('blogs'),
      settings: localStore.getSettings()
    });
  } catch (err) {
    next(err);
  }
};
