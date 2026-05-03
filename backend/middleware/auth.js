
/* ══════════════════════════════════════════════════════════════════
   middleware/auth.js  —  JWT Authentication & Authorization
══════════════════════════════════════════════════════════════════ */

const jwt = require("jsonwebtoken");
const { Users } = require("../db");

const ACCESS_SECRET  = process.env.JWT_SECRET         || "sgh_dev_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET  || "sgh_dev_refresh";
const ACCESS_EXP     = process.env.JWT_EXPIRES_IN      || "15m";
const REFRESH_EXP    = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/* ──────────────────────────────────────
   Token generators
────────────────────────────────────── */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXP }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXP }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

/* ──────────────────────────────────────
   Middleware: require valid JWT
────────────────────────────────────── */
function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = Users.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ error: "Account not found or deactivated" });

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ──────────────────────────────────────
   Middleware: optional auth (no error if missing)
────────────────────────────────────── */
function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = Users.findById(decoded.id);
      if (user && user.isActive) req.user = decoded;
    }
  } catch {}
  next();
}

/* ──────────────────────────────────────
   Middleware: require admin role
────────────────────────────────────── */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

/* ──────────────────────────────────────
   Middleware: require self or admin
────────────────────────────────────── */
function requireSelfOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
  if (req.user.role === "admin" || req.user.id === req.params.userId) return next();
  return res.status(403).json({ error: "Access denied" });
}
module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireSelfOrAdmin,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
