import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, items: coupons });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }
    if (coupon.minBookingAmount && Number(amount) < coupon.minBookingAmount) {
      return res.status(400).json({ success: false, message: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon.` });
    }
    const discount = Math.min((Number(amount) * coupon.discountPercent) / 100, coupon.maxDiscount || 999999);
    res.json({ success: true, discount, finalAmount: Number(amount) - discount, code: coupon.code });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err) {
    next(err);
  }
};
