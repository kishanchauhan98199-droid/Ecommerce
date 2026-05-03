const Order  = require('../.models/Order');
const Product = require('../.models/Product');

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    if (!orderItems?.length) return res.status(400).json({ message: 'No order items' });

    // Verify prices server-side
    const itemsWithPrices = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);
        if (product.stock < item.quantity) throw new Error(`${product.name} out of stock`);
        return { product: product._id, name: product.name, image: product.image, price: product.price, quantity: item.quantity };
      })
    );

    const itemsPrice    = itemsWithPrices.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice >= 2000 ? 0 : 199;
    const taxPrice      = Math.round(itemsPrice * 0.18);
    const totalPrice    = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems: itemsWithPrices,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    // Decrement stock
    await Promise.all(
      itemsWithPrices.map(item =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        })
      )
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders  (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/orders/:id/status  (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'Delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
    if (status === 'Confirmed') { order.isPaid = true; order.paidAt = Date.now(); }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };