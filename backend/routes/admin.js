const { authenticate, requireAdmin } = require("../middleware/auth");
/* ══════════════════════════════════════════════════════════════════
   routes/admin.js  —  Admin Dashboard & Analytics
   All routes require authenticate + requireAdmin
══════════════════════════════════════════════════════════════════ */

const router = require("express").Router();
const { Analytics, Users, Products, Orders } = require("../db");


// All admin routes are protected
router.use(authenticate, requireAdmin);

/* ──────────────────────────────────────
   GET /api/admin/dashboard
   Returns high-level analytics summary
────────────────────────────────────── */
router.get("/dashboard", (req, res) => {
  const summary = Analytics.summary();
  return res.json({
    stats: {
      totalUsers:    summary.totalUsers,
      totalProducts: summary.totalProducts,
      totalOrders:   summary.totalOrders,
      totalRevenue:  summary.totalRevenue,
    },
    topProducts:  summary.topProducts,
    recentOrders: summary.recentOrders,
    timestamp: new Date().toISOString(),
  });
});

/* ──────────────────────────────────────
   GET /api/admin/users
────────────────────────────────────── */
router.get("/users", (req, res) => {
  return res.json(Users.list());
});

/* ──────────────────────────────────────
   PUT /api/admin/users/:userId/role
   Body: { role: "admin" | "user" }
────────────────────────────────────── */
router.put("/users/:userId/role", (req, res) => {
  const { role } = req.body;
  if (!["admin","user"].includes(role)) return res.status(400).json({ error: "Role must be 'admin' or 'user'" });
  const user = Users.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.email === process.env.ADMIN_EMAIL) return res.status(403).json({ error: "Cannot modify super admin" });
  const updated = Users.update(req.params.userId, { role });
  return res.json({ message: "Role updated", user: updated });
});

/* ──────────────────────────────────────
   GET /api/admin/orders
────────────────────────────────────── */
router.get("/orders", (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let orders = Orders.all();
  if (status) orders = orders.filter(o => o.status === status);

  const total = orders.length;
  const pageNum = Math.max(1, Number(page));
  const pageSize = Math.min(Number(limit), 100);
  const data = orders.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return res.json({
    orders: data,
    pagination: { total, page: pageNum, pages: Math.ceil(total / pageSize), limit: pageSize },
  });
});

/* ──────────────────────────────────────
   GET /api/admin/products
────────────────────────────────────── */
router.get("/products", (req, res) => {
  return res.json(Products.list());
});

/* ──────────────────────────────────────
   GET /api/admin/revenue
   Revenue breakdown by category
────────────────────────────────────── */
router.get("/revenue", (req, res) => {
  const orders = Orders.all().filter(o => o.status !== "cancelled");
  const byStatus = {};
  const byCategory = {};

  orders.forEach(order => {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    order.items.forEach(item => {
      // We don't store category on order items directly — approximate from product name
      const cat = "general";
      byCategory[cat] = (byCategory[cat] || 0) + (item.price * item.qty);
    });
  });

  return res.json({
    totalRevenue: Orders.revenue(),
    totalOrders:  orders.length,
    byStatus,
    monthlyRevenue: generateMonthlySummary(orders),
  });
});

function generateMonthlySummary(orders) {
  const months = {};
  orders.forEach(order => {
    const month = order.createdAt.slice(0, 7); // "2024-01"
    if (!months[month]) months[month] = { revenue: 0, count: 0 };
    months[month].revenue += order.total;
    months[month].count++;
  });
  return months;
}

module.exports = router;