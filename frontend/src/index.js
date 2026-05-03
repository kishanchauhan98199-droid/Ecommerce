import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
// ════════════════════════════════════════════════════════════
//  client/src/utils/index.js  —  Shared utility functions
// ════════════════════════════════════════════════════════════

// ── Currency ─────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees
 * @param {number} amount
 * @returns {string}  e.g. "₹1,23,456"
 */
export const formatPrice = (amount) =>
  '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/**
 * Calculate discount percentage
 * @param {number} price
 * @param {number} originalPrice
 * @returns {number|null}
 */
export const discountPercent = (price, originalPrice) =>
  originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;

// ── Date / Time ───────────────────────────────────────────────

/**
 * Format an ISO date string to "15 Jan 2024"
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

/**
 * Relative time: "2 hours ago", "3 days ago"
 */
export const timeAgo = (isoString) => {
  const diff  = Date.now() - new Date(isoString).getTime();
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return 'just now';
};

// ── String helpers ─────────────────────────────────────────────

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const truncate = (s, max = 80) =>
  s && s.length > max ? s.slice(0, max).trimEnd() + '...' : s;

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Validation ────────────────────────────────────────────────

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const isValidPincode = (pin) => /^\d{6}$/.test(pin);

export const isValidCardNumber = (num) =>
  /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(num.replace(/\s/g, ''));

export const isValidCVV = (cvv) => /^\d{3,4}$/.test(cvv);

export const isValidExpiry = (exp) => {
  const [mm, yy] = exp.split('/').map(s => parseInt(s, 10));
  if (!mm || !yy || mm < 1 || mm > 12) return false;
  const now = new Date();
  const expDate = new Date(2000 + yy, mm - 1);
  return expDate > now;
};

/**
 * Validate checkout address form
 * @returns {Object} errors map
 */
export const validateAddress = ({ fullName, email, phone, street, city, pincode }) => {
  const errors = {};
  if (!fullName?.trim())            errors.fullName = 'Full name is required';
  if (!isValidEmail(email || ''))   errors.email    = 'Valid email is required';
  if (!isValidPhone(phone || ''))   errors.phone    = 'Valid 10-digit phone is required';
  if (!street?.trim())              errors.street   = 'Address is required';
  if (!city?.trim())                errors.city     = 'City is required';
  if (!isValidPincode(pincode||'')) errors.pincode  = 'Valid 6-digit pincode is required';
  return errors;
};

// ── Cart helpers ──────────────────────────────────────────────

export const cartSubtotal = (items) =>
  items.reduce((sum, i) => sum + i.price * (i.quantity || i.qty || 1), 0);

export const shippingCost = (subtotal) => subtotal >= 2000 ? 0 : 199;

export const taxAmount = (subtotal) => Math.round(subtotal * 0.18);

export const grandTotal = (subtotal) => {
  const ship = shippingCost(subtotal);
  const tax  = taxAmount(subtotal);
  return subtotal + ship + tax;
};

// ── Storage helpers ───────────────────────────────────────────

export const storage = {
  get:    (key, fallback = null) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set:    (key, value)           => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  remove: (key)                  => { try { localStorage.removeItem(key); } catch {} },
};

// ── Constants ─────────────────────────────────────────────────

export const CATEGORIES = ['Women', 'Men', 'Accessories'];

export const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
];

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export const STATUS_BADGE_TYPE = {
  Pending:   'gold',
  Confirmed: 'info',
  Shipped:   'info',
  Delivered: 'success',
  Cancelled: 'danger',
};

export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi (NCT)','Puducherry',
];