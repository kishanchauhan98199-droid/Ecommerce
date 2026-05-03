const express = require("express");
const router = express.Router();

// Simple coupon
const coupon = {
  code: "SAVE10",
  discount: 10 // %
};

router.post("/apply", (req, res) => {
  const { code, total } = req.body;

  if (code !== coupon.code) {
    return res.json({ message: "Invalid Coupon" });
  }

  const discount = (total * coupon.discount) / 100;
  const finalPrice = total - discount;

  res.json({
    message: "Coupon Applied",
    discount,
    finalPrice
  });
});

module.exports = router;