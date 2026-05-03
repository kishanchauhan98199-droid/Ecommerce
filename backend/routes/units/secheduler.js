/**
 * server/jobs/scheduler.js
 * Background jobs using node-cron
 * Install: npm install node-cron
 *
 * Add to server.js:
 *   if (process.env.NODE_ENV === 'production') require('./jobs/scheduler');
 */

const cron    = require('node-cron');
const Order   = require('../models/Order');
const User    = require('../models/User');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendShippedNotification } = require('../utils/sendEmail');

console.log('🕐 Background job scheduler initialised');

// ── Job 1: Auto-send confirmation emails for new paid orders ──
// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const unnotified = await Order.find({
      isPaid:             true,
      confirmationSent:   { $ne: true },
      createdAt:          { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).populate('user', 'name email');

    for (const order of unnotified) {
      if (!order.user?.email) continue;
      try {
        await sendOrderConfirmation(order, order.user);
        order.confirmationSent = true;
        await order.save();
        console.log(`📧 Confirmation sent for order ${order.orderNumber}`);
      } catch (err) {
        console.error(`Failed to send confirmation for ${order._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Job 1 error:', err.message);
  }
});

// ── Job 2: Auto-send shipped notification emails ──────────────
// Runs every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    const shipped = await Order.find({
      status:           'Shipped',
      shippedEmailSent: { $ne: true },
    }).populate('user', 'name email');

    for (const order of shipped) {
      if (!order.user?.email) continue;
      try {
        await sendShippedNotification(order, order.user);
        order.shippedEmailSent = true;
        await order.save();
        console.log(`🚚 Shipped email sent for order ${order.orderNumber}`);
      } catch (err) {
        console.error(`Failed to send shipped email for ${order._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Job 2 error:', err.message);
  }
});

// ── Job 3: Flag low-stock products ────────────────────────────
// Runs every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    const lowStock = await Product.find({ stock: { $lte: 5, $gt: 0 }, isActive: true });
    if (lowStock.length > 0) {
      console.warn(`⚠ Low stock alert: ${lowStock.length} products need restocking:`);
      lowStock.forEach(p => console.warn(`  - ${p.name} (${p.stock} remaining)`));
      // TODO: send admin email or Slack notification
    }
  } catch (err) {
    console.error('Job 3 error:', err.message);
  }
});

// ── Job 4: Cancel unpaid COD orders after 24 hours ───────────
// Runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const expiredCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Order.updateMany(
      {
        status:        'Pending',
        paymentMethod: 'cod',
        isPaid:        false,
        createdAt:     { $lt: expiredCutoff },
      },
      { status: 'Cancelled' }
    );
    if (result.modifiedCount > 0) {
      console.log(`🗑 Auto-cancelled ${result.modifiedCount} expired COD orders`);
      // Restore stock for cancelled orders
      const cancelled = await Order.find({
        status:    'Cancelled',
        createdAt: { $lt: expiredCutoff },
        stockRestored: { $ne: true },
      });
      for (const order of cancelled) {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, sold: -item.quantity },
          });
        }
        order.stockRestored = true;
        await order.save();
      }
    }
  } catch (err) {
    console.error('Job 4 error:', err.message);
  }
});

// ── Job 5: Daily analytics summary ──────────────────────────
// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    const [orders, newUsers] = await Promise.all([
      Order.find({ createdAt: { $gte: yesterday, $lt: today } }),
      User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    ]);

    const revenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    console.log(`📊 Daily Summary (${yesterday.toDateString()}):`);
    console.log(`   Orders:   ${orders.length}`);
    console.log(`   Revenue:  ₹${revenue.toLocaleString('en-IN')}`);
    console.log(`   New users:${newUsers}`);
  } catch (err) {
    console.error('Job 5 error:', err.message);
  }
});