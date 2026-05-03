const express = require('express');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/payment/create-intent
// Creates a Stripe PaymentIntent on the server; client confirms it
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body; // amount in smallest unit (paise)

    if (!amount || amount < 100)
      return res.status(400).json({ message: 'Invalid amount (minimum ₹1)' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount),   // must be integer paise
      currency,
      metadata: { userId: req.user._id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/razorpay/create-order
// Creates a Razorpay order (alternative Indian gateway)
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount } = req.body;
    const order = await instance.orders.create({
      amount:   Math.round(amount),     // paise
      currency: 'INR',
      receipt:  `sgh_${Date.now()}`,
    });

    res.json({
      id:       order.id,
      currency: order.currency,
      amount:   order.amount,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/razorpay/verify
// Verify Razorpay signature after payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid payment signature' });

    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/webhook  (Stripe webhook — no auth)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log(`✅ Payment succeeded: ${pi.id} for ${pi.amount / 100} ${pi.currency.toUpperCase()}`);
      // TODO: update Order.isPaid, Order.paidAt
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.log(`❌ Payment failed: ${pi.id}`);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;