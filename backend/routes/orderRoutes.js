/* ══════════════════════════════════════════════════════════════════
   routes/orderRoutes.js  —  Order Placement & Tracking
   ──────────────────────────────────────────────────────────────────
   POST   /api/orders                     Place order from cart (auth)
   GET    /api/orders                     My orders (auth)
   GET    /api/orders/admin/all           All orders (admin)
   PATCH  /api/orders/admin/:id/status    Update status (admin)
   GET    /api/orders/:id                 Single order (auth)
   PATCH  /api/orders/:id/cancel          Cancel order (auth)
══════════════════════════════════════════════════════════════════ */

const router                           = require("express").Router();
const { Orders, Carts, Users }         = require("../db");
const { authenticate, requireAdmin }   = require("../middleware/auth");
const { validate, rules }              = require("../middleware/validate");
const EmailService                     = require("../services/email");

/* ──────────────────────────────────────
   POST /api/orders  —  place order from cart
────────────────────────────────────── */
router.post("/", authenticate, validate(rules.placeOrder), async (req, res) => {
  try {
    const { address, paymentMethod = "cod", coupon } = req.body;
    const cartItems = Carts.get(req.user.id);

    if (!cartItems.length)
      return res.status(400).json({ error: "Your cart is empty" });

    const items = cartItems.map((i) => ({
      productId: i.productId,
      name:      i.product.name,
      price:     i.product.price,
      image:     (i.product.images || [])[0] || "",
      qty:       i.qty,
    }));

    const order = Orders.create(req.user.id, {
      items,
      address,
      paymentMethod,
      coupon,
    });

    // Clear cart after successful order creation
    Carts.clear(req.user.id);

    // Send confirmation email (non-blocking — failure must not break response)
    const user = Users.findById(req.user.id);
    if (user) {
      EmailService.orderConfirmed(Users.safe(user), order).catch((err) =>
        console.error("[ORDERS] email error:", err)
      );
    }

    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("[ORDERS] place error:", err);
    return res.status(500).json({ error: "Could not place order" });
  }
});

/* ──────────────────────────────────────
   GET /api/orders  —  my orders
────────────────────────────────────── */
router.get("/", authenticate, (req, res) => {
  return res.json(Orders.forUser(req.user.id));
});

/* ──────────────────────────────────────
   IMPORTANT: static admin routes must come BEFORE /:id
   to prevent "admin" being captured as an order id param.
────────────────────────────────────── */

/* GET /api/orders/admin/all  —  ADMIN */
router.get("/admin/all", authenticate, requireAdmin, (req, res) => {
  return res.json(Orders.all());
});

/* PATCH /api/orders/admin/:id/status  —  ADMIN */
router.patch("/admin/:id/status", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(status))
      return res.status(400).json({
        error: `Status must be one of: ${allowed.join(", ")}`,
      });

    const order = Orders.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const updated = Orders.updateStatus(
      req.params.id,
      status,
      note || `Status updated to ${status}`
    );

    // Notify user (non-blocking)
    const user = Users.findById(order.userId);
    if (user) {
      EmailService.orderStatusUpdate(Users.safe(user), updated).catch((err) =>
        console.error("[ORDERS] status email error:", err)
      );
    }

    return res.json({ message: "Order status updated", order: updated });
  } catch (err) {
    console.error("[ORDERS] admin status error:", err);
    return res.status(500).json({ error: "Could not update order status" });
  }
});

/* ──────────────────────────────────────
   GET /api/orders/:id  —  single order
────────────────────────────────────── */
router.get("/:id", authenticate, (req, res) => {
  const order = Orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Only the owner or an admin may view
  if (order.userId !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });

  return res.json(order);
});

/* ──────────────────────────────────────
   PATCH /api/orders/:id/cancel  —  cancel my order
────────────────────────────────────── */
router.patch("/:id/cancel", authenticate, (req, res) => {
  const order = Orders.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.userId !== req.user.id)
    return res.status(403).json({ error: "Access denied" });

  if (["shipped", "delivered"].includes(order.status))
    return res.status(400).json({
      error: "Cannot cancel an order that has been shipped or delivered",
    });

  const updated = Orders.updateStatus(
    req.params.id,
    "cancelled",
    req.body.reason || "Cancelled by customer"
  );
  return res.json({ message: "Order cancelled", order: updated });
});

module.exports = router; // ← original exported wrong variable (router from users.js)