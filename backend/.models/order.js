const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
      phone:    { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod', 'netbanking'],
      default: 'cod',
    },
    paymentResult: {
      id:       String,
      status:   String,
      update_time: String,
      email:    String,
    },
    itemsPrice:    { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice:      { type: Number, required: true },
    totalPrice:    { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    isPaid:        { type: Boolean, default: false },
    paidAt:        { type: Date },
    isDelivered:   { type: Boolean, default: false },
    deliveredAt:   { type: Date },
    trackingNumber:{ type: String, default: '' },
    notes:         { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SGH-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});
orderSchema.add({ orderNumber: { type: String, unique: true } });

module.exports = mongoose.model('Order', orderSchema);