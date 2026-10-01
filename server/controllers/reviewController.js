import Review from '../models/Review.js';

export const getReviews = async (req, res, next) => {
  try {
    const { targetSlug, targetType } = req.query;
    const filter = { published: true };
    if (targetSlug) filter.targetSlug = targetSlug;
    if (targetType) filter.targetType = targetType;
    const items = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, message: 'Review submitted for moderation.', data: review });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};
