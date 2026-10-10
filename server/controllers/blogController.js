import Blog from '../models/Blog.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

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

    const total = await Blog.countDocuments(filter);
    const items = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const rawSlug = req.params.slug || '';
    const isObjectId = mongoose.Types.ObjectId.isValid(rawSlug) && rawSlug.length === 24;
    const query = isObjectId
      ? { $or: [{ _id: rawSlug }, { slug: rawSlug }] }
      : { slug: rawSlug };

    let blog = await Blog.findOne(query);
    if (!blog && !isObjectId) {
      blog = await Blog.findOne({
        $or: [
          { slug: { $regex: `^${rawSlug}$`, $options: 'i' } },
          { title: { $regex: rawSlug.replace(/-/g, ' '), $options: 'i' } }
        ]
      });
    }
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    res.json(blog);
  } catch (err) {
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
    const matchCriteria = [];
    if (data.slug) matchCriteria.push({ slug: data.slug });
    if (data.title) matchCriteria.push({ title: data.title });

    let exists = null;
    if (matchCriteria.length > 0) {
      exists = await Blog.findOne({ $or: matchCriteria });
    }

    if (exists) {
      const updated = await Blog.findByIdAndUpdate(exists._id, data, { new: true, runValidators: false });
      return res.status(200).json({ success: true, data: updated });
    }
    const blog = await Blog.create(data);
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    next(err);
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
        blog = await Blog.findOneAndUpdate(
          { $or: matchCriteria },
          { $set: data },
          { new: true, upsert: true, runValidators: false }
        );
      } else {
        blog = await Blog.create(data);
      }
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
    let blog = null;
    if (isObjectId) {
      blog = await Blog.findByIdAndDelete(req.params.id);
    } else {
      blog = await Blog.findOneAndDelete({ $or: [{ slug: req.params.id }, { title: req.params.id }] });
    }
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    res.json({ success: true, message: 'Blog deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
