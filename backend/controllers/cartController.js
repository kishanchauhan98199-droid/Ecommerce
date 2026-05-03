const Cart    = require('../.models/Cart');
const Product = require('../.models/Product');
const coupon = require('../.models/coupon')

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name image price stock');
    res.json(cart || { items: [], totalPrice: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, quantity, price: product.price });

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/:productId
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      const item = cart.items.find(i => i.product.toString() === req.params.productId);
      if (!item) return res.status(404).json({ message: 'Item not in cart' });
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart (clear)
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };