/**
 * server/utils/sendEmail.js
 * Send transactional emails via Nodemailer (SMTP / Gmail)
 */

const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ── Generic send ──────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER) {
    console.warn('⚠ Email not configured — skipping send to', to);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Style Gallery Hub" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`📧 Email sent to ${to}: ${subject}`);
};

// ── Order confirmation template ────────────────────────────────
const orderConfirmationEmail = (order, user) => ({
  to:      user.email,
  subject: `Order Confirmed — ${order.orderNumber || order._id}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#faf9f6;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #e8e2d9;border-radius:12px;overflow:hidden;">

    <!-- Header -->
    <div style="background:#0f0f0f;padding:32px 40px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#b8860b;letter-spacing:4px;">SGH</div>
      <div style="font-size:9px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Style Gallery Hub</div>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h1 style="font-size:28px;font-weight:400;letter-spacing:1px;margin-bottom:8px;">Order Confirmed ✓</h1>
      <p style="color:#777;font-size:14px;margin-bottom:28px;">
        Hi ${user.name}, thank you for your purchase! We're preparing your order right now.
      </p>

      <!-- Order meta -->
      <div style="background:#fdf8f0;border:1px solid #e8e2d9;border-radius:8px;padding:20px;margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;">Order Number</span>
          <span style="font-size:14px;font-weight:700;">${order.orderNumber || String(order._id).slice(-8).toUpperCase()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;">Date</span>
          <span style="font-size:14px;">${new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;">Payment</span>
          <span style="font-size:14px;text-transform:capitalize;">${order.paymentMethod}</span>
        </div>
      </div>

      <!-- Items -->
      <h3 style="font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;">Items Ordered</h3>
      ${order.orderItems.map(item => `
        <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #f0ebe2;">
          ${item.image ? `<img src="${item.image}" width="60" height="60" style="object-fit:cover;border-radius:6px;" alt="${item.name}">` : ''}
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;">${item.name}</div>
            <div style="font-size:12px;color:#888;">Qty: ${item.quantity}</div>
          </div>
          <div style="font-size:14px;font-weight:700;color:#b8860b;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
      `).join('')}

      <!-- Totals -->
      <div style="margin-top:20px;padding-top:16px;">
        ${[['Subtotal', order.itemsPrice], ['Shipping', order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`], ['GST', `₹${order.taxPrice}`]].map(([l,v]) => `
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#777;margin-bottom:8px;">
            <span>${l}</span><span>${typeof v === 'number' ? '₹'+v.toLocaleString('en-IN') : v}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;border-top:1px solid #e8e2d9;padding-top:12px;margin-top:4px;">
          <span>Total</span>
          <span style="color:#b8860b;">₹${order.totalPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Delivery address -->
      <div style="margin-top:28px;padding:20px;background:#f5f3ef;border-radius:8px;">
        <h3 style="font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;color:#888;">Delivering To</h3>
        <p style="font-size:14px;margin:0;line-height:1.7;">
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}<br>
          ${order.shippingAddress.phone}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0f0f0f;padding:24px 40px;text-align:center;">
      <p style="color:#555;font-size:12px;margin:0;">
        © 2024 Style Gallery Hub · Questions? Email us at support@stylegalleryhub.com<br>
        <a href="#" style="color:#b8860b;text-decoration:none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,
});

// ── Shipped notification ──────────────────────────────────────
const shippedEmail = (order, user) => ({
  to:      user.email,
  subject: `Your Order is On the Way! — ${order.orderNumber}`,
  html: `
    <div style="max-width:600px;margin:40px auto;font-family:Arial,sans-serif;text-align:center;">
      <div style="background:#0f0f0f;padding:24px;border-radius:12px 12px 0 0;">
        <div style="font-size:24px;font-weight:700;color:#b8860b;letter-spacing:4px;">SGH</div>
      </div>
      <div style="background:#fff;border:1px solid #e8e2d9;border-top:none;padding:40px;border-radius:0 0 12px 12px;">
        <div style="font-size:48px;margin-bottom:16px;">🚚</div>
        <h2 style="font-size:28px;font-weight:400;margin-bottom:8px;">Your Order is Shipped!</h2>
        <p style="color:#777;margin-bottom:24px;">Hi ${user.name}, your order <strong>${order.orderNumber}</strong> is on its way.</p>
        ${order.trackingNumber ? `<p style="font-size:14px;">Tracking: <strong>${order.trackingNumber}</strong></p>` : ''}
        <p style="color:#777;font-size:13px;">Estimated delivery: 2–5 business days</p>
      </div>
    </div>
  `,
});

module.exports = {
  sendEmail,
  sendOrderConfirmation: async (order, user) => sendEmail(orderConfirmationEmail(order, user)),
  sendShippedNotification: async (order, user) => sendEmail(shippedEmail(order, user)),
};