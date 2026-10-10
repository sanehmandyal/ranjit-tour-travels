import Blog from '../models/Blog.js';
import slugify from 'slugify';
import mongoose from 'mongoose';
import { localStore } from '../utils/localStore.js';

export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const q = req.query.q || '';
    const category = req.query.category || '';
    const publishedOnly = req.query.admin ? {} : { published: true };

    const filter = { ...publishedOnly };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;

    let items = [];
    let total = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        total = await Blog.countDocuments(filter);
        items = await Blog.find(filter)
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (dbErr) {
        console.warn('[DB Fallback] getBlogs:', dbErr.message);
      }
    }

    if (!items || items.length === 0) {
      const local = localStore.getCollection('blogs');
      items = req.query.admin ? local : local.filter(b => b.published !== false);
      total = items.length;
    }

    return res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    const local = localStore.getCollection('blogs');
    return res.json({
      success: true,
      items: local,
      total: local.length,
      page: 1,
      pages: 1
    });
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let blog = null;
    if (mongoose.connection.readyState === 1) {
      try {
        blog = await Blog.findOne(query);
        if (!blog && !isObjectId) {
          blog = await Blog.findOne({
            $or: [
              { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
              { title: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
            ]
          });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] getBlogBySlug:', dbErr.message);
      }
    }

    if (!blog) {
      blog = localStore.getItem('blogs', rawSlug);
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    return res.json(blog);
  } catch (err) {
    const blog = localStore.getItem('blogs', req.params.slug);
    if (blog) return res.json(blog);
    next(err);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.published === undefined) data.published = true;
    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    let blog = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const matchCriteria = [];
        if (data.slug) matchCriteria.push({ slug: data.slug });
        if (data.title) matchCriteria.push({ title: data.title });

        let exists = null;
        if (matchCriteria.length > 0) {
          exists = await Blog.findOne({ $or: matchCriteria });
        }

        if (exists) {
          blog = await Blog.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
        } else {
          blog = await Blog.create(data);
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] createBlog:', dbErr.message);
      }
    }

    const saved = localStore.upsertItem('blogs', blog?.toObject ? blog.toObject() : data);
    return res.status(201).json({ success: true, data: blog || saved });
  } catch (err) {
    const saved = localStore.upsertItem('blogs', req.body);
    return res.status(201).json({ success: true, data: saved });
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.id;
    if (data.published === undefined) data.published = true;
    if (data.title && !data.slug) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    let blog = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;

        if (isObjectId) {
          blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: false });
        }

        if (!blog) {
          const matchCriteria = [];
          if (data.slug) matchCriteria.push({ slug: data.slug });
          if (req.params.id && req.params.id !== 'undefined' && req.params.id !== 'null') matchCriteria.push({ slug: req.params.id });
          if (data.title) matchCriteria.push({ title: data.title });

          if (matchCriteria.length > 0) {
            const existing = await Blog.findOne({ $or: matchCriteria });
            if (existing) {
              blog = await Blog.findByIdAndUpdate(existing._id, { $set: data }, { new: true, runValidators: false });
            } else {
              blog = await Blog.create(data);
            }
          } else {
            blog = await Blog.create(data);
          }
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] updateBlog:', dbErr.message);
      }
    }

    const saved = localStore.upsertItem('blogs', { ...(blog?.toObject ? blog.toObject() : data), _id: req.params.id });
    return res.json({ success: true, data: blog || saved });
  } catch (err) {
    const saved = localStore.upsertItem('blogs', { ...req.body, _id: req.params.id });
    return res.json({ success: true, data: saved });
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        if (isObjectId) {
          await Blog.findByIdAndDelete(req.params.id);
        } else {
          await Blog.findOneAndDelete({ $or: [{ slug: req.params.id }, { title: req.params.id }] });
        }
      } catch (dbErr) {
        console.warn('[DB Fallback] deleteBlog:', dbErr.message);
      }
    }

    localStore.deleteItem('blogs', req.params.id);
    return res.json({ success: true, message: 'Blog deleted successfully.' });
  } catch (err) {
    localStore.deleteItem('blogs', req.params.id);
    return res.json({ success: true, message: 'Blog deleted successfully.' });
  }
};
