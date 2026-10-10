import Coupon from '../models/Coupon.js';
import { localStore } from '../utils/localStore.js';

export const getCoupons = async (req, res, next) => {
  try {
    let coupons = [];
    try {
      coupons = await Coupon.find().sort({ createdAt: -1 }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] getCoupons:', dbErr.message);
    }

    if (!coupons || coupons.length === 0) {
      coupons = localStore.getCollection('coupons');
    }

    res.json({ success: true, items: coupons });
  } catch (err) {
    res.json({ success: true, items: localStore.getCollection('coupons') });
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    let coupon = null;
    try {
      coupon = await Coupon.create(req.body);
    } catch (dbErr) {
      console.warn('[DB Fallback] createCoupon:', dbErr.message);
    }
    const saved = localStore.upsertItem('coupons', coupon ? coupon.toObject() : req.body);
    res.status(201).json({ success: true, data: coupon || saved });
  } catch (err) {
    const saved = localStore.upsertItem('coupons', req.body);
    res.status(201).json({ success: true, data: saved });
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    let coupon = null;
    try {
      coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), isActive: true }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] validateCoupon:', dbErr.message);
    }

    if (!coupon) {
      const localCoupons = localStore.getCollection('coupons');
      coupon = localCoupons.find(c => (c.code || '').toUpperCase() === (code || '').toUpperCase() && c.isActive !== false);
    }

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }
    if (coupon.minBookingAmount && Number(amount) < coupon.minBookingAmount) {
      return res.status(400).json({ success: false, message: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon.` });
    }
    const discount = Math.min((Number(amount) * (coupon.discountPercent || coupon.discountValue || 10)) / 100, coupon.maxDiscount || 999999);
    res.json({ success: true, discount, finalAmount: Number(amount) - discount, code: coupon.code });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    let coupon = null;
    try {
      coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true }).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] updateCoupon:', dbErr.message);
    }
    const saved = localStore.upsertItem('coupons', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: coupon || saved });
  } catch (err) {
    const saved = localStore.upsertItem('coupons', { ...req.body, _id: req.params.id });
    res.json({ success: true, data: saved });
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    try {
      await Coupon.findByIdAndDelete(req.params.id).maxTimeMS(2500);
    } catch (dbErr) {
      console.warn('[DB Fallback] deleteCoupon:', dbErr.message);
    }
    localStore.deleteItem('coupons', req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    localStore.deleteItem('coupons', req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  }
};
