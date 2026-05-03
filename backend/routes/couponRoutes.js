// ── models/Coupon.js ──────────────────────────────────────────
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:         { type: String, enum: ['percent', 'fixed'], required: true },
    value:        { type: Number, required: true, min: 0 },   // % or ₹ amount
    minOrder:     { type: Number, default: 0 },                // minimum cart value
    maxDiscount:  { type: Number, default: null },             // cap for percent type
    usageLimit:   { type: Number, default: null },             // null = unlimited
    usedCount:    { type: Number, default: 0 },
    userLimit:    { type: Number, default: 1 },               // uses per user
    usedBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom:    { type: Date, default: Date.now },
    validUntil:   { type: Date, required: true },
    isActive:     { type: Boolean, default: true },
    description:  { type: String, default: '' },
    applicableTo: { type: String, enum: ['all', 'Women', 'Men', 'Accessories'], default: 'all' },
  },
  { timestamps: true }
);

// Calculate discount for a given cart total
couponSchema.methods.calculateDiscount = function(cartTotal) {
  if (this.type === 'percent') {
    const disc = (cartTotal * this.value) / 100;
    return this.maxDiscount ? Math.min(disc, this.maxDiscount) : disc;
  }
  return Math.min(this.value, cartTotal); // fixed, cannot exceed cart total
};

// Check if coupon is still valid
couponSchema.methods.isValid = function(userId, cartTotal) {
  const now = new Date();
  if (!this.isActive)                        return { ok: false, msg: 'Coupon is inactive' };
  if (now < this.validFrom)                  return { ok: false, msg: 'Coupon is not yet active' };
  if (now > this.validUntil)                 return { ok: false, msg: 'Coupon has expired' };
  if (cartTotal < this.minOrder)             return { ok: false, msg: `Minimum order of ₹${this.minOrder} required` };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { ok: false, msg: 'Coupon usage limit reached' };
  const userUses = this.usedBy.filter(id => id.toString() === userId.toString()).length;
  if (userUses >= this.userLimit)            return { ok: false, msg: 'You have already used this coupon' };
  return { ok: true };
};

module.exports = mongoose.model('Coupon', couponSchema);

// ════════════════════════════════════════════════════════════
// routes/couponRoutes.js
// ════════════════════════════════════════════════════════════
const express  = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// POST /api/coupons/apply — validate a coupon code for current cart
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const { ok, msg } = coupon.isValid(req.user._id, cartTotal);
    if (!ok) return res.status(400).json({ message: msg });

    const discount = coupon.calculateDiscount(cartTotal);
    res.json({
      valid:       true,
      code:        coupon.code,
      type:        coupon.type,
      value:       coupon.value,
      discount:    Math.round(discount),
      description: coupon.description,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons — create coupon (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/coupons — list all coupons (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/coupons/:id — update (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/coupons/:id (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;