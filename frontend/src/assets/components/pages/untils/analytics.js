/**
 * server/utils/analytics.js
 * MongoDB aggregation pipelines for admin analytics
 * Used by GET /api/admin/analytics
 */

const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');

// ── Revenue by period ─────────────────────────────────────────
const getRevenueSeries = async (period = 'month') => {
  const now   = new Date();
  let start, groupFormat, sortField;

  switch (period) {
    case 'week':
      start = new Date(now); start.setDate(now.getDate() - 7);
      groupFormat = '%Y-%m-%d';
      sortField   = '_id';
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      groupFormat = '%Y-%m';
      sortField   = '_id';
      break;
    default: // month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = '%Y-%m-%d';
      sortField   = '_id';
  }

  return Order.aggregate([
    { $match: { createdAt: { $gte: start }, status: { $ne: 'Cancelled' } } },
    { $group: {
        _id:      { $dateToString: { format: groupFormat, date: '$createdAt' } },
        revenue:  { $sum: '$totalPrice' },
        orders:   { $sum: 1 },
        avgOrder: { $avg: '$totalPrice' },
    }},
    { $sort: { [sortField]: 1 } },
    { $project: { _id:0, date:'$_id', revenue:1, orders:1, avgOrder:{ $round:['$avgOrder',0] } } },
  ]);
};

// ── Top products by revenue ───────────────────────────────────
const getTopProducts = async (limit = 10) =>
  Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $unwind: '$orderItems' },
    { $group: {
        _id:       '$orderItems.product',
        name:      { $first: '$orderItems.name' },
        revenue:   { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        unitsSold: { $sum: '$orderItems.quantity' },
        orders:    { $sum: 1 },
    }},
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $lookup: { from:'products', localField:'_id', foreignField:'_id', as:'product' } },
    { $unwind: { path:'$product', preserveNullAndEmptyArrays: true } },
    { $project: { _id:0, productId:'$_id', name:1, revenue:1, unitsSold:1, orders:1, image:'$product.image', category:'$product.category' } },
  ]);

// ── Category breakdown ────────────────────────────────────────
const getCategoryStats = async () =>
  Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $unwind: '$orderItems' },
    { $lookup: { from:'products', localField:'orderItems.product', foreignField:'_id', as:'prod' } },
    { $unwind: { path:'$prod', preserveNullAndEmptyArrays: true } },
    { $group: {
        _id:     '$prod.category',
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        units:   { $sum: '$orderItems.quantity' },
    }},
    { $sort: { revenue: -1 } },
    { $project: { _id:0, category:'$_id', revenue:1, units:1 } },
  ]);

// ── Order status distribution ─────────────────────────────────
const getOrderStatusBreakdown = async () =>
  Order.aggregate([
    { $group: { _id:'$status', count:{ $sum:1 }, revenue:{ $sum:'$totalPrice' } } },
    { $sort:  { count: -1 } },
    { $project: { _id:0, status:'$_id', count:1, revenue:1 } },
  ]);

// ── User growth ───────────────────────────────────────────────
const getUserGrowth = async (months = 6) => {
  const start = new Date();
  start.setMonth(start.getMonth() - months);

  return User.aggregate([
    { $match: { createdAt: { $gte: start }, role: 'user' } },
    { $group: {
        _id:  { $dateToString: { format:'%Y-%m', date:'$createdAt' } },
        new:  { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
    { $project: { _id:0, month:'$_id', new:1 } },
  ]);
};

// ── Aggregated KPIs ───────────────────────────────────────────
const getKPIs = async () => {
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const lastMonth = new Date(thisMonth); lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [current, previous, userCount, productCount, lowStock] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: thisMonth }, status: { $ne:'Cancelled' } } },
      { $group: { _id:null, revenue:{ $sum:'$totalPrice' }, orders:{ $sum:1 }, avgOrder:{ $avg:'$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lt: thisMonth }, status: { $ne:'Cancelled' } } },
      { $group: { _id:null, revenue:{ $sum:'$totalPrice' }, orders:{ $sum:1 } } },
    ]),
    User.countDocuments({ role:'user' }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
  ]);

  const cur = current[0] || { revenue:0, orders:0, avgOrder:0 };
  const prv = previous[0] || { revenue:1, orders:1 };
  const pct = (cur, prv) => prv > 0 ? Number(((cur - prv) / prv * 100).toFixed(1)) : 0;

  return {
    revenue:      { value: cur.revenue,   change: pct(cur.revenue, prv.revenue) },
    orders:       { value: cur.orders,    change: pct(cur.orders,  prv.orders)  },
    avgOrder:     { value: Math.round(cur.avgOrder || 0) },
    users:        { value: userCount },
    products:     { value: productCount },
    lowStockItems:{ value: lowStock },
  };
};

// ── Express route handler ─────────────────────────────────────
const analyticsController = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const [revenue, topProducts, categories, statuses, userGrowth, kpis] = await Promise.all([
      getRevenueSeries(period),
      getTopProducts(10),
      getCategoryStats(),
      getOrderStatusBreakdown(),
      getUserGrowth(6),
      getKPIs(),
    ]);

    res.json({ revenue, topProducts, categories, statuses, userGrowth, kpis, period });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyticsController, getRevenueSeries, getTopProducts, getCategoryStats, getOrderStatusBreakdown, getUserGrowth, getKPIs };