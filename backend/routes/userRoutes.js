
/* ══════════════════════════════════════════════════════════════════
   routes/userRoutes.js  —  User Profile & Account Management
   ──────────────────────────────────────────────────────────────────
   GET    /api/users/me                  My profile (auth)
   PUT    /api/users/me                  Update profile (auth)
   POST   /api/users/me/change-password  Change password (auth)
   GET    /api/users                     All users (admin)
   DELETE /api/users/:userId             Deactivate user (admin)
══════════════════════════════════════════════════════════════════ */

const router = require("express").Router();
const bcrypt = require("bcryptjs");

const { Users }                    = require("../db");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validate, rules }          = require("../middleware/validate");

/* ──────────────────────────────────────
   GET /api/users/me  —  fetch own profile
────────────────────────────────────── */
router.get("/me", authenticate, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(Users.safe(user));
});

/* ──────────────────────────────────────
   PUT /api/users/me  —  update own profile
────────────────────────────────────── */
router.put("/me", authenticate, validate(rules.updateProfile), (req, res) => {
  const { name, phone, address, avatar } = req.body;
  const updated = Users.update(req.user.id, { name, phone, address, avatar });
  return updated
    ? res.json({ message: "Profile updated", user: Users.safe(updated) })
    : res.status(404).json({ error: "User not found" });
});

/* ──────────────────────────────────────
   POST /api/users/me/change-password
────────────────────────────────────── */
router.post(
  "/me/change-password",
  authenticate,
  validate(rules.changePassword),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const record = Users.findById(req.user.id);
      if (!record) return res.status(404).json({ error: "User not found" });

      const valid = await bcrypt.compare(currentPassword, record.password);
      if (!valid)
        return res.status(400).json({ error: "Current password is incorrect" });

      const hashed = await bcrypt.hash(newPassword, 12);
      Users.update(req.user.id, { password: hashed });

      return res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("[USERS] change-password error:", err);
      return res.status(500).json({ error: "Could not change password" });
    }
  }
);

/* ──────────────────────────────────────
   GET /api/users  —  ADMIN: list all users
────────────────────────────────────── */
router.get("/", authenticate, requireAdmin, (req, res) => {
  const users = Users.list();
  // Strip passwords before sending
  return res.json(users.map((u) => Users.safe(u)));
});

/* ──────────────────────────────────────
   DELETE /api/users/:userId  —  ADMIN: deactivate user
────────────────────────────────────── */
router.delete("/:userId", authenticate, requireAdmin, (req, res) => {
  // Prevent admin from deactivating themselves
  if (req.params.userId === req.user.id) {
    return res.status(400).json({ error: "You cannot deactivate your own account" });
  }

  const user = Users.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.isActive) return res.status(409).json({ error: "User is already deactivated" });

  Users.update(req.params.userId, { isActive: false });
  return res.json({ message: "User deactivated successfully" });
});

module.exports = router;