import Blog from '../models/Blog.js';
import slugify from 'slugify';

export const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }]
    });
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
    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    const exists = await Blog.findOne({ slug: data.slug });
    if (exists) {
      data.slug = `${data.slug}-${Date.now()}`;
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
    if (data.title && !data.slug) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    res.json({ success: true, data: blog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }
    res.json({ success: true, message: 'Blog deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
