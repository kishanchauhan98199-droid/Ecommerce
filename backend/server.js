/* ══════════════════════════════════════════════════════════════════
   server.js  —  Style Gallery Hub · Complete Backend API
   ──────────────────────────────────────────────────────────────────
   All Endpoints:
   ──────────────────────────────────────────────────────────────────
   AUTH
     POST   /api/auth/register           Register new user
     POST   /api/auth/login              Login + get tokens
     POST   /api/auth/refresh            Refresh access token
     POST   /api/auth/logout             Invalidate refresh token
     GET    /api/auth/me                 Get current user (auth)
     POST   /api/auth/forgot-password    Send OTP to email
     POST   /api/auth/reset-password     Reset password with OTP

   PRODUCTS
     GET    /api/products                List + filter + search + paginate
     GET    /api/products/categories     Category counts
     GET    /api/products/featured       Top 8 by rating
     GET    /api/products/:id            Single product
     GET    /api/products/:id/reviews    Product reviews
     POST   /api/products/:id/reviews    Add review (auth)
     POST   /api/products/:id/helpful/:reviewId  Mark review helpful
     POST   /api/products                Create (admin)
     PUT    /api/products/:id            Update (admin)
     DELETE /api/products/:id            Soft-delete (admin)

   USER
     GET    /api/users/me                My profile (auth)
     PUT    /api/users/me                Update profile (auth)
     POST   /api/users/me/change-password Change password (auth)
     GET    /api/users                   All users (admin)
     DELETE /api/users/:userId           Deactivate user (admin)

   CART
     GET    /api/cart                    Get my cart (auth)
     POST   /api/cart                    Add item (auth)
     PUT    /api/cart/:productId         Update quantity (auth)
     DELETE /api/cart/:productId         Remove item (auth)
     DELETE /api/cart                    Clear cart (auth)

   WISHLIST
     GET    /api/wishlist                Get my wishlist (auth)
     POST   /api/wishlist/:productId     Toggle item (auth)
     GET    /api/wishlist/:productId/check  Check if in wishlist (auth)

   ORDERS
     POST   /api/orders                  Place order from cart (auth)
     GET    /api/orders                  My orders (auth)
     GET    /api/orders/:id              Single order (auth)
     PATCH  /api/orders/:id/cancel       Cancel order (auth)
     GET    /api/orders/admin/all        All orders (admin)
     PATCH  /api/orders/admin/:id/status Update status (admin)

   ADMIN
     GET    /api/admin/dashboard         Analytics summary (admin)
     GET    /api/admin/users             All users (admin)
     PUT    /api/admin/users/:id/role    Change role (admin)
     GET    /api/admin/orders            All orders paginated (admin)
     GET    /api/admin/products          All products (admin)
     GET    /api/admin/revenue           Revenue analytics (admin)

   SYSTEM
     GET    /api/health                  Health check
     GET    /api/                        API info
   ──────────────────────────────────────────────────────────────────
   Static:  /uploads/:filename           Uploaded product images
══════════════════════════════════════════════════════════════════ */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const { seed } = require("./db");

// ── Route imports (all consistent names) ──────────────────────────
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/admin");
//const couponRoutes = require("./routes/coupon");
//const uploadRoutes = require("./routes/upload");

/* ──────────────────────────────────────
   App setup  (must come BEFORE any app.use())
────────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 5002;

/* ──────────────────────────────────────
   CORS
────────────────────────────────────── */
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5002"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors()); // pre-flight

/* ──────────────────────────────────────
   Security headers
────────────────────────────────────── */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow static images
  })
);

/* ──────────────────────────────────────
   Request logging
────────────────────────────────────── */
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

/* ──────────────────────────────────────
   Body parsers
────────────────────────────────────── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ──────────────────────────────────────
   Rate limiting
────────────────────────────────────── */
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  skip: (req) =>
    process.env.NODE_ENV === "development" && req.ip === "::1",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { error: "Too many auth attempts. Try again in 15 minutes." },
  skip: () => process.env.NODE_ENV === "development",
});

app.use("/api/", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

/* ──────────────────────────────────────
   Static files (uploaded images)
────────────────────────────────────── */
const uploadDir = path.join(
  __dirname,
  process.env.UPLOAD_DIR || "uploads"
);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

/* ──────────────────────────────────────
   API Routes  (single, correct registration block)
────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
//app.use("/api/coupon", couponRoutes);
//app.use("/api/upload", uploadRoutes);


/* ──────────────────────────────────────
   Health check
────────────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    env: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

/* ──────────────────────────────────────
   API index — list all endpoints
────────────────────────────────────── */
app.get("/api", (req, res) => {
  res.json({
    name: "Style Gallery Hub API",
    version: "1.0.0",
    docs: "See README.md for full endpoint documentation",
    endpoints: {
      auth: [
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/auth/refresh",
        "POST /api/auth/logout",
        "GET /api/auth/me",
        "POST /api/auth/forgot-password",
        "POST /api/auth/reset-password",
      ],
      products: [
        "GET /api/products",
        "GET /api/products/:id",
        "GET /api/products/categories",
        "GET /api/products/featured",
        "POST /api/products (admin)",
        "PUT /api/products/:id (admin)",
        "DELETE /api/products/:id (admin)",
      ],
      cart: [
        "GET /api/cart",
        "POST /api/cart",
        "PUT /api/cart/:productId",
        "DELETE /api/cart/:productId",
        "DELETE /api/cart",
      ],
      wishlist: [
        "GET /api/wishlist",
        "POST /api/wishlist/:productId",
        "GET /api/wishlist/:productId/check",
      ],
      orders: [
        "POST /api/orders",
        "GET /api/orders",
        "GET /api/orders/:id",
        "PATCH /api/orders/:id/cancel",
      ],
      admin: [
        "GET /api/admin/dashboard",
        "GET /api/admin/users",
        "GET /api/admin/orders",
        "GET /api/admin/revenue",
      ],
      health: ["GET /api/health"],
    },
  });
});

/* ──────────────────────────────────────
   404 handler
────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    tip: "Check /api for available endpoints",
  });
});

/* ──────────────────────────────────────
   Global error handler
────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 5}MB allowed.`,
    });
  }
  if (err.message === "Only image files are allowed") {
    return res.status(415).json({ error: err.message });
  }
  // CORS error
  if (err.message && err.message.startsWith("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  console.error("[UNHANDLED ERROR]", err.stack || err.message);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

/* ──────────────────────────────────────
   Start server
────────────────────────────────────── */
async function start() {
  await seed();

  app.listen(PORT, () => {
    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║     STYLE GALLERY HUB — Backend API         ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Server:  http://localhost:${PORT}               ║`);
    console.log(`║  Health:  http://localhost:${PORT}/api/health     ║`);
    console.log(`║  Env:     ${(process.env.NODE_ENV || "development").padEnd(34)}║`);
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Admin:   ${(process.env.ADMIN_EMAIL || "admin@sgh.com").padEnd(34)}║`);
    console.log("╚══════════════════════════════════════════════╝\n");
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = app; // for testing