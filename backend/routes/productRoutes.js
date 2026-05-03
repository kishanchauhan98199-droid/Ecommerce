
/* ══════════════════════════════════════════════════════════════════
   routes/products.js  —  Product CRUD + Search
   GET    /api/products            – list with filters/search/pagination
   GET    /api/products/:id        – single product
   GET    /api/products/:id/reviews
   POST   /api/products/:id/reviews  (auth)
   POST   /api/products            (admin)
   PUT    /api/products/:id        (admin)
   DELETE /api/products/:id        (admin)
   POST   /api/products/:id/helpful/:reviewId
══════════════════════════════════════════════════════════════════ */

const router  = require("express").Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const { Products, Reviews } = require("../db");
const { authenticate, optionalAuth, requireAdmin } = require("../middleware/auth");
const { validate, rules } = require("../middleware/validate");

/* ──────────────────────────────────────
   Multer — image uploads
────────────────────────────────────── */
const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `product-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error("Only image files are allowed"), allowed.includes(ext));
  },
});

/* ──────────────────────────────────────
   GET /api/products
   Query: category, search, badge, minPrice, maxPrice,
          sortBy, sortDir, page, limit
────────────────────────────────────── */
router.get("/", optionalAuth, (req, res) => {
  const {
    category, search, badge, minPrice, maxPrice,
    sortBy = "createdAt", sortDir = "desc",
    page = 1, limit = process.env.DEFAULT_PAGE_SIZE || 16,
  } = req.query;

  const result = Products.query({ category, search, badge, minPrice, maxPrice, sortBy, sortDir, page, limit });

  // Attach wishlist flag if authenticated
  // (handled client-side via wishlist endpoint — kept simple here)

  return res.json({
    products: result.data,
    pagination: {
      total: result.total,
      page:  result.page,
      pages: result.pages,
      limit: result.limit,
    },
  });
});

/* ──────────────────────────────────────
   GET /api/products/categories
   Returns category counts
────────────────────────────────────── */
router.get("/categories", (req, res) => {
  const all = Products.list();
  const cats = ["women","men","kids","accessories"];
  const counts = cats.reduce((acc, c) => {
    acc[c] = all.filter(p => p.category === c).length;
    return acc;
  }, { all: all.length });
  return res.json(counts);
});

/* ──────────────────────────────────────
   GET /api/products/featured
   Returns 4 top-rated products
────────────────────────────────────── */
router.get("/featured", (req, res) => {
  const result = Products.query({ sortBy: "rating", sortDir: "desc", limit: 8 });
  return res.json(result.data);
});

/* ──────────────────────────────────────
   GET /api/products/:id
────────────────────────────────────── */
router.get("/:id", (req, res) => {
  const product = Products.findById(req.params.id);
  if (!product || !product.isActive) return res.status(404).json({ error: "Product not found" });
  return res.json(product);
});

/* ──────────────────────────────────────
   GET /api/products/:id/reviews
────────────────────────────────────── */
router.get("/:id/reviews", (req, res) => {
  const product = Products.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(Reviews.forProduct(req.params.id));
});

/* ──────────────────────────────────────
   POST /api/products/:id/reviews  (auth)
────────────────────────────────────── */
router.post("/:id/reviews", authenticate, validate(rules.review), (req, res) => {
  const product = Products.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const result = Reviews.add(req.params.id, req.user.id, req.body);
  if (result.error) return res.status(409).json({ error: result.error });
  return res.status(201).json(result);
});

/* ──────────────────────────────────────
   POST /api/products/:id/helpful/:reviewId
────────────────────────────────────── */
router.post("/:id/helpful/:reviewId", (req, res) => {
  const review = Reviews.markHelpful(req.params.id, req.params.reviewId);
  if (!review) return res.status(404).json({ error: "Review not found" });
  return res.json({ helpful: review.helpful });
});

/* ──────────────────────────────────────
   POST /api/products  (admin)
────────────────────────────────────── */
router.post("/", authenticate, requireAdmin, upload.array("images", 5), validate(rules.createProduct), (req, res) => {
  const { name, price, originalPrice, category, description, badge, stock, tags } = req.body;

  // Attach uploaded image paths
  const uploadedImages = (req.files || []).map(f =>
    `${req.protocol}://${req.get("host")}/uploads/${f.filename}`
  );
  const existingImages = req.body.images
    ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images])
    : [];

  const product = Products.create({
    name,
    price:         Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : null,
    category,
    description:   description || "",
    badge:         badge || null,
    stock:         Number(stock) || 0,
    tags:          tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
    images:        [...existingImages, ...uploadedImages],
  });

  return res.status(201).json(product);
});

/* ──────────────────────────────────────
   PUT /api/products/:id  (admin)
────────────────────────────────────── */
router.put("/:id", authenticate, requireAdmin, upload.array("images", 5), (req, res) => {
  const product = Products.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const uploadedImages = (req.files || []).map(f =>
    `${req.protocol}://${req.get("host")}/uploads/${f.filename}`
  );

  const updates = { ...req.body };
  if (updates.price)         updates.price = Number(updates.price);
  if (updates.originalPrice) updates.originalPrice = updates.originalPrice === "null" ? null : Number(updates.originalPrice);
  if (updates.stock)         updates.stock = Number(updates.stock);
  if (updates.tags && typeof updates.tags === "string") updates.tags = updates.tags.split(",").map(t => t.trim());
  if (uploadedImages.length) updates.images = [...(product.images || []), ...uploadedImages];

  const updated = Products.update(req.params.id, updates);
  return res.json(updated);
});

/* ──────────────────────────────────────
   DELETE /api/products/:id  (admin)
────────────────────────────────────── */
router.delete("/:id", authenticate, requireAdmin, (req, res) => {
  const ok = Products.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: "Product not found" });
  return res.json({ message: "Product deleted" });
});

module.exports = router;