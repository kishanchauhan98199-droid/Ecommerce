
/* ══════════════════════════════════════════════════════════════════
   routes/cartRoutes.js  —  Cart Management
   ──────────────────────────────────────────────────────────────────
   GET    /api/cart                 Get my cart (auth)
   POST   /api/cart                 Add item (auth)
   PUT    /api/cart/:productId      Update quantity (auth)
   DELETE /api/cart/:productId      Remove item (auth)
   DELETE /api/cart                 Clear cart (auth)
══════════════════════════════════════════════════════════════════ */

const router               = require("express").Router();
const { Carts, Products }  = require("../db");
const { authenticate }     = require("../middleware/auth");
const { validate, rules }  = require("../middleware/validate");
console.log("DEBUG validate:", validate);
console.log("DEBUG rules:", rules);
/* ──────────────────────────────────────
   GET /api/cart
────────────────────────────────────── */
router.get("/", authenticate, (req, res) => {
  const items = Carts.get(req.user.id);
  return res.json({
    items,
    count: Carts.count(req.user.id),
    total: Carts.total(req.user.id),
  });
});

/* ──────────────────────────────────────
   POST /api/cart  —  { productId, qty }
────────────────────────────────────── */
router.post("/", authenticate, validate(rules.cartAdd), (req, res) => {
  const { productId, qty = 1 } = req.body;

  const product = Products.findById(productId);
  if (!product || !product.isActive)
    return res.status(404).json({ error: "Product not found" });
  if (product.stock !== undefined && product.stock < 1)
    return res.status(409).json({ error: "Product out of stock" });

  const items = Carts.add(req.user.id, productId, Number(qty));
  return res.status(201).json({
    message: "Added to cart",
    items,
    count: Carts.count(req.user.id),
    total: Carts.total(req.user.id),
  });
});

/* ──────────────────────────────────────
   PUT /api/cart/:productId  —  { qty }
────────────────────────────────────── */
router.put("/:productId", authenticate, validate(rules.cartUpdate), (req, res) => {
  const qty = Number(req.body.qty);
  if (qty < 1)
    return res.status(400).json({ error: "Quantity must be at least 1" });

  const items = Carts.updateQty(req.user.id, req.params.productId, qty);
  return res.json({
    items,
    count: Carts.count(req.user.id),
    total: Carts.total(req.user.id),
  });
});

/* ──────────────────────────────────────
   DELETE /api/cart  —  clear entire cart
   IMPORTANT: must be registered BEFORE /:productId
   so Express does not treat "" as a productId param.
────────────────────────────────────── */
router.delete("/", authenticate, (req, res) => {
  Carts.clear(req.user.id);
  return res.json({ message: "Cart cleared", items: [], count: 0, total: 0 });
});

/* ──────────────────────────────────────
   DELETE /api/cart/:productId  —  remove one item
────────────────────────────────────── */
router.delete("/:productId", authenticate, (req, res) => {
  const items = Carts.remove(req.user.id, req.params.productId);
  return res.json({
    message: "Removed from cart",
    items,
    count: Carts.count(req.user.id),
    total: Carts.total(req.user.id),
  });
});

module.exports = router; // ← was missing in original