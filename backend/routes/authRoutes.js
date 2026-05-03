
/* ══════════════════════════════════════════════════════════════════
   routes/auth.js  —  Authentication Routes
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/refresh
   POST /api/auth/logout
   POST /api/auth/forgot-password
   POST /api/auth/reset-password
   GET  /api/auth/me
══════════════════════════════════════════════════════════════════ */

const router = require("express").Router();
const { Users, RefreshTokens, OTPStore } = require("../db");
const { 
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require("../middleware/auth");
const { validate, rules } = require("../middleware/validate");
const EmailService = require("../services/email");

/* ──────────────────────────────────────
   Helper: generate 6-digit OTP
────────────────────────────────────── */
const genOTP = () => String(Math.floor(100000 + Math.random() * 900000));

/* ──────────────────────────────────────
   POST /api/auth/register
────────────────────────────────────── */
router.post("/register", validate(rules.register), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (Users.findByEmail(email)) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const user = await Users.create({ name, email, password, role: "user" });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    RefreshTokens.add(refreshToken);

    // Send welcome email (non-blocking)
    EmailService.welcome(user).catch(console.error);

    return res.status(201).json({
      message: "Account created successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("[AUTH] register error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/* ──────────────────────────────────────
   POST /api/auth/login
────────────────────────────────────── */
router.post("/login", validate(rules.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const record = Users.findByEmail(email);

    if (!record || !record.isActive) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await Users.verifyPassword(password, record.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = Users.safe(record);
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    RefreshTokens.add(refreshToken);

    return res.json({
      message: "Logged in successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("[AUTH] login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

/* ──────────────────────────────────────
   POST /api/auth/refresh
   Body: { refreshToken }
────────────────────────────────────── */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });
  if (!RefreshTokens.has(refreshToken)) return res.status(403).json({ error: "Invalid refresh token" });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = Users.findById(decoded.id);
    if (!user || !user.isActive) return res.status(403).json({ error: "User not found" });

    // Rotate refresh token
    RefreshTokens.remove(refreshToken);
    const newRefresh = generateRefreshToken(user);
    RefreshTokens.add(newRefresh);

    return res.json({
      accessToken:  generateAccessToken(Users.safe(user)),
      refreshToken: newRefresh,
    });
  } catch {
    return res.status(403).json({ error: "Refresh token expired or invalid" });
  }
});

/* ──────────────────────────────────────
   POST /api/auth/logout
   Body: { refreshToken }
────────────────────────────────────── */
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) RefreshTokens.remove(refreshToken);
  return res.json({ message: "Logged out successfully" });
});

/* ──────────────────────────────────────
   GET /api/auth/me
────────────────────────────────────── */
router.get("/me", authenticate, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: Users.safe(user) });
});

/* ──────────────────────────────────────
   POST /api/auth/forgot-password
   Sends OTP to email
────────────────────────────────────── */
router.post("/forgot-password", validate(rules.forgotPassword), async (req, res) => {
  try {
    const { email } = req.body;
    const user = Users.findByEmail(email);

    // Always return success (don't reveal if email exists)
    if (user) {
      const otp = genOTP();
      OTPStore.set(email, otp);
      EmailService.passwordReset(user, otp).catch(console.error);
      console.log(`[AUTH] OTP for ${email}: ${otp}`); // dev log
    }

    return res.json({ message: "If an account exists, a password reset OTP has been sent." });
  } catch (err) {
    console.error("[AUTH] forgot-password error:", err);
    return res.status(500).json({ error: "Failed to process request" });
  }
});

/* ──────────────────────────────────────
   POST /api/auth/reset-password
   Body: { email, otp, newPassword }
────────────────────────────────────── */
router.post("/reset-password", validate(rules.resetPassword), async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = Users.findByEmail(email);

    if (!user) return res.status(400).json({ error: "Invalid request" });

    const valid = OTPStore.verify(email, otp);
    if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });

    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(newPassword, 12);
    Users.update(user.id, { password: hashed });

    return res.json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error("[AUTH] reset-password error:", err);
    return res.status(500).json({ error: "Password reset failed" });
  }
});

module.exports = router;