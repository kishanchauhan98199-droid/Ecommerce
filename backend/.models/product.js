const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null },
    category:    { type: String, required: true, enum: ['Women', 'Men', 'Accessories', 'Kids'] },
    image:       { type: String, default: '' },          // Cloudinary URL
    images:      [{ type: String }],
    stock:       { type: Number, required: true, default: 0, min: 0 },
    sold:        { type: Number, default: 0 },
    tag:         { type: String, enum: ['Bestseller', 'New', 'Sale', null], default: null },
    reviews:     [reviewSchema],
    rating:      { type: Number, default: 0 },
    numReviews:  { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    brand:       { type: String, default: '' },
    sku:         { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });

// Auto-calculate rating when reviews are updated
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Number((total / this.reviews.length).toFixed(1));
  this.numReviews = this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);