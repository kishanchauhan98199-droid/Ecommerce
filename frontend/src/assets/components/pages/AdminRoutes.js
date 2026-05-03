const express = require('express');
const { analyticsController } = require('../utils/analytics');
const { protect, admin }      = require('../middleware/auth');
const { cacheMiddleware }      = require('../utils/cache');

const router = express.Router();

// GET /api/admin/analytics?period=month|week|year
router.get('/analytics',
  protect,
  admin,
  cacheMiddleware(60, req => `sgh:analytics:${req.query.period || 'month'}`),
  analyticsController
);

// GET /api/admin/dashboard  — quick summary for dashboard widget
router.get('/dashboard', protect, admin, async (req, res) => {
  const Order   = require('../models/Order');
  const Product = require('../models/Product');
  const User    = require('../models/User');

  const [orderCount, revenue, userCount, productCount, recentOrders, lowStock] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match:{ status:{ $ne:'Cancelled' } } }, { $group:{ _id:null, total:{ $sum:'$totalPrice' } } }]),
    User.countDocuments({ role:'user' }),
    Product.countDocuments({ isActive:true }),
    Order.find().sort({ createdAt:-1 }).limit(5).populate('user','name email'),
    Product.find({ stock:{ $lte:5 }, isActive:true }).select('name stock').limit(5),
  ]);

  res.json({
    stats: { orders: orderCount, revenue: revenue[0]?.total || 0, users: userCount, products: productCount },
    recentOrders,
    lowStock,
  });
});

module.exports = router;