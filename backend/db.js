/* ══════════════════════════════════════════════════════════════════
   db.js  —  In-Memory Data Store
   Production note: Replace with MongoDB/PostgreSQL adapter
   keeping the same exported interface so routes don't change.
══════════════════════════════════════════════════════════════════ */

const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");

/* ──────────────────────────────────────
   TABLES
────────────────────────────────────── */
const DB = {
  users:         new Map(),
  products:      new Map(),
  carts:         new Map(),   // userId → [{ productId, qty }]
  wishlists:     new Map(),   // userId → Set<productId>
  orders:        new Map(),
  reviews:       new Map(),   // productId → [review]
  refreshTokens: new Set(),
  otpStore:      new Map(),   // email → { otp, expires }
};

/* ──────────────────────────────────────
   SEED PRODUCTS
────────────────────────────────────── */
const SEED_PRODUCTS = [
  { name:"Silk Wrap Dress",        price:32000, originalPrice:42000, category:"women",      badge:"sale", description:"Luxuriously soft silk wrap dress with adjustable tie waist. Timeless silhouette perfect for any occasion.", tags:["silk","dress","women"], stock:45, rating:4.8, reviewCount:124, images:["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80"] },
  { name:"Tailored Wool Blazer",   price:54000, originalPrice:null,  category:"men",        badge:"new",  description:"Impeccably tailored in premium Italian wool. Sharp structure meets everyday wearability.", tags:["blazer","wool","men"],   stock:30, rating:4.9, reviewCount:87,  images:["https://images.unsplash.com/photo-1594938298603-c8148c4b4e1c?w=600&q=80"] },
  { name:"Burnished Leather Tote", price:71000, originalPrice:null,  category:"accessories",badge:"hot",  description:"Full-grain leather tote with burnished finish. Spacious interior with zip pocket and magnetic closure.", tags:["bag","leather","tote"], stock:18, rating:4.7, reviewCount:56,  images:["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"] },
  { name:"Cashmere Column Coat",   price:98000, originalPrice:130000,category:"women",      badge:"sale", description:"Floor-length cashmere coat with clean column silhouette. The ultimate investment piece.", tags:["coat","cashmere","women"],stock:12, rating:5.0, reviewCount:42,  images:["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"] },
  { name:"Slim Merino Trousers",   price:25000, originalPrice:null,  category:"men",        badge:"new",  description:"Slim-fit trousers in fine merino wool. Wrinkle-resistant and breathable for all-day comfort.", tags:["trousers","merino","men"], stock:60, rating:4.6, reviewCount:98,  images:["https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80"] },
  { name:"Gold Link Chain",        price:36000, originalPrice:null,  category:"accessories",badge:null,   description:"18k gold-plated link chain necklace. Chunky yet refined — the perfect layering piece.", tags:["jewelry","gold","chain"],  stock:35, rating:4.8, reviewCount:73,  images:["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"] },
  { name:"Bias-Cut Satin Skirt",   price:22500, originalPrice:28500, category:"women",      badge:"sale", description:"Elegant bias-cut satin midi skirt with liquid drape. Available in ivory, blush, and midnight.", tags:["skirt","satin","women"],  stock:27, rating:4.7, reviewCount:61,  images:["https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=600&q=80"] },
  { name:"Kids Denim Jacket",      price:8900,  originalPrice:null,  category:"kids",       badge:"new",  description:"Classic denim jacket for little ones. Sturdy yet soft fabric with brass button details.", tags:["jacket","denim","kids"],  stock:80, rating:4.9, reviewCount:145, images:["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80"] },
  { name:"Egyptian Cotton Shirt",  price:15500, originalPrice:null,  category:"men",        badge:null,   description:"Breathable 200-thread-count Egyptian cotton shirt. Slim fit with mother-of-pearl buttons.", tags:["shirt","cotton","men"],  stock:55, rating:4.5, reviewCount:112, images:["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"] },
  { name:"Kids Floral Dress",      price:7200,  originalPrice:9500,  category:"kids",       badge:"sale", description:"Cheerful floral print dress with smocked bodice. Machine washable and easy to wear.", tags:["dress","floral","kids"],  stock:40, rating:4.8, reviewCount:89,  images:["https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=600&q=80"] },
  { name:"Suede Chelsea Boots",    price:63000, originalPrice:null,  category:"men",        badge:"hot",  description:"Supple suede Chelsea boots with elastic side panels and stacked heel. Timeless British craft.", tags:["boots","suede","men"],   stock:22, rating:4.9, reviewCount:67,  images:["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80"] },
  { name:"South Sea Pearl Drops",  price:49000, originalPrice:null,  category:"accessories",badge:"new",  description:"South Sea cultured pearl drop earrings set in 14k white gold. Rare lustre, exceptional quality.", tags:["earrings","pearl","jewelry"],stock:8,rating:5.0, reviewCount:31,  images:["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"] },
  { name:"Kids Sneaker Set",       price:5800,  originalPrice:7200,  category:"kids",       badge:"sale", description:"Lightweight sneakers with velcro strap and cushioned sole. Durable enough for every adventure.", tags:["sneakers","shoes","kids"],stock:65, rating:4.7, reviewCount:203, images:["https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80"] },
  { name:"Fluid Linen Trousers",   price:24500, originalPrice:33000, category:"women",      badge:"sale", description:"Wide-leg linen trousers with pleated front. Effortlessly chic for warm-weather dressing.", tags:["trousers","linen","women"],stock:38, rating:4.6, reviewCount:54,  images:["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80"] },
  { name:"Structured Saddle Bag",  price:93000, originalPrice:null,  category:"accessories",badge:null,   description:"Hand-crafted structured saddle bag in vegetable-tanned leather. Develops a unique patina over time.", tags:["bag","leather","accessories"],stock:10,rating:4.9,reviewCount:28,images:["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80"] },
  { name:"Kids Striped Hoodie",    price:4500,  originalPrice:null,  category:"kids",       badge:null,   description:"Cosy organic cotton hoodie with candy-stripe pattern and kangaroo pocket.", tags:["hoodie","cotton","kids"],  stock:90, rating:4.8, reviewCount:176, images:["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80"] },
];

/* ──────────────────────────────────────
   HELPERS
────────────────────────────────────── */
function now() { return new Date().toISOString(); }
function newId() { return uuid(); }

/* ──────────────────────────────────────
   USER CRUD
────────────────────────────────────── */
const Users = {
  create: async ({ name, email, password, role = "user" }) => {
    const id = newId();
    const hashed = await bcrypt.hash(password, 12);
    const user = {
      id, name, email: email.toLowerCase(),
      password: hashed, role,
      avatar: null, phone: null, address: null,
      createdAt: now(), updatedAt: now(),
      isActive: true,
    };
    DB.users.set(id, user);
    return Users.safe(user);
  },

  findByEmail: (email) => {
    for (const u of DB.users.values()) {
      if (u.email === email.toLowerCase()) return u;
    }
    return null;
  },

  findById: (id) => DB.users.get(id) || null,

  update: (id, data) => {
    const user = DB.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: now() };
    DB.users.set(id, updated);
    return Users.safe(updated);
  },

  safe: (u) => {
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  },

  list: () => [...DB.users.values()].map(Users.safe),

  verifyPassword: (plain, hashed) => bcrypt.compare(plain, hashed),

  count: () => DB.users.size,
};

/* ──────────────────────────────────────
   PRODUCT CRUD
────────────────────────────────────── */
const Products = {
  create: (data) => {
    const id = newId();
    const product = {
      id, ...data,
      createdAt: now(), updatedAt: now(),
      isActive: true,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
    };
    DB.products.set(id, product);
    return product;
  },

  findById: (id) => DB.products.get(id) || null,

  update: (id, data) => {
    const p = DB.products.get(id);
    if (!p) return null;
    const updated = { ...p, ...data, updatedAt: now() };
    DB.products.set(id, updated);
    return updated;
  },

  delete: (id) => {
    const p = DB.products.get(id);
    if (!p) return false;
    DB.products.set(id, { ...p, isActive: false });
    return true;
  },

  query: ({ category, search, badge, minPrice, maxPrice, sortBy = "createdAt", sortDir = "desc", page = 1, limit = 16 }) => {
    let results = [...DB.products.values()].filter(p => p.isActive);

    if (category && category !== "all")  results = results.filter(p => p.category === category);
    if (badge)      results = results.filter(p => p.badge === badge);
    if (search)     results = results.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (minPrice)   results = results.filter(p => p.price >= Number(minPrice));
    if (maxPrice)   results = results.filter(p => p.price <= Number(maxPrice));

    // Sort
    results.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      const dir = sortDir === "asc" ? 1 : -1;
      return va < vb ? -dir : va > vb ? dir : 0;
    });

    const total = results.length;
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(Number(limit), 100);
    const pages = Math.ceil(total / pageSize);
    const data = results.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    return { data, total, page: pageNum, pages, limit: pageSize };
  },

  list: () => [...DB.products.values()].filter(p => p.isActive),
  count: () => [...DB.products.values()].filter(p => p.isActive).length,
};

/* ──────────────────────────────────────
   CART CRUD
────────────────────────────────────── */
const Carts = {
  get: (userId) => {
    const raw = DB.carts.get(userId) || [];
    return raw.map(item => {
      const product = Products.findById(item.productId);
      if (!product) return null;
      return { ...item, product };
    }).filter(Boolean);
  },

  add: (userId, productId, qty = 1) => {
    const cart = DB.carts.get(userId) || [];
    const idx = cart.findIndex(i => i.productId === productId);
    if (idx >= 0) {
      cart[idx].qty = Math.max(1, cart[idx].qty + qty);
    } else {
      cart.push({ productId, qty: Math.max(1, qty), addedAt: now() });
    }
    DB.carts.set(userId, cart);
    return Carts.get(userId);
  },

  updateQty: (userId, productId, qty) => {
    const cart = DB.carts.get(userId) || [];
    if (qty <= 0) {
      DB.carts.set(userId, cart.filter(i => i.productId !== productId));
    } else {
      const idx = cart.findIndex(i => i.productId === productId);
      if (idx >= 0) cart[idx].qty = qty;
      DB.carts.set(userId, cart);
    }
    return Carts.get(userId);
  },

  remove: (userId, productId) => {
    const cart = (DB.carts.get(userId) || []).filter(i => i.productId !== productId);
    DB.carts.set(userId, cart);
    return Carts.get(userId);
  },

  clear: (userId) => {
    DB.carts.set(userId, []);
    return [];
  },

  total: (userId) => {
    return Carts.get(userId).reduce((s, i) => s + i.product.price * i.qty, 0);
  },

  count: (userId) => {
    return (DB.carts.get(userId) || []).reduce((s, i) => s + i.qty, 0);
  },
};

/* ──────────────────────────────────────
   WISHLIST CRUD
────────────────────────────────────── */
const Wishlists = {
  get: (userId) => {
    const ids = [...(DB.wishlists.get(userId) || new Set())];
    return ids.map(id => Products.findById(id)).filter(Boolean);
  },

  toggle: (userId, productId) => {
    const set = DB.wishlists.get(userId) || new Set();
    const added = !set.has(productId);
    if (added) set.add(productId); else set.delete(productId);
    DB.wishlists.set(userId, set);
    return { added, wishlist: Wishlists.get(userId) };
  },

  has: (userId, productId) => {
    return (DB.wishlists.get(userId) || new Set()).has(productId);
  },

  count: (userId) => (DB.wishlists.get(userId) || new Set()).size,
};

/* ──────────────────────────────────────
   ORDER CRUD
────────────────────────────────────── */
const Orders = {
  create: (userId, { items, address, paymentMethod = "cod", coupon = null }) => {
    const id = newId();
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = coupon === "WELCOME20" ? Math.round(subtotal * 0.20) : 0;
    const shipping = subtotal >= 5000 ? 0 : 99;
    const total    = subtotal - discount + shipping;

    const order = {
      id, userId, items,
      address, paymentMethod, coupon,
      subtotal, discount, shipping, total,
      status: "confirmed",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      timeline: [{ status: "confirmed", time: now(), note: "Order placed successfully" }],
      createdAt: now(), updatedAt: now(),
    };
    DB.orders.set(id, order);
    return order;
  },

  findById:  (id)     => DB.orders.get(id) || null,
  forUser:   (userId) => [...DB.orders.values()].filter(o => o.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
  all:       ()       => [...DB.orders.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)),

  updateStatus: (id, status, note = "") => {
    const order = DB.orders.get(id);
    if (!order) return null;
    const updated = {
      ...order,
      status,
      updatedAt: now(),
      timeline: [...order.timeline, { status, time: now(), note }],
    };
    DB.orders.set(id, updated);
    return updated;
  },

  count: () => DB.orders.size,
  revenue: () => [...DB.orders.values()].reduce((s, o) => s + o.total, 0),
};

/* ──────────────────────────────────────
   REVIEWS CRUD
────────────────────────────────────── */
const Reviews = {
  add: (productId, userId, { rating, title, body }) => {
    const list = DB.reviews.get(productId) || [];
    const existing = list.find(r => r.userId === userId);
    if (existing) return { error: "Already reviewed" };

    const review = { id: newId(), productId, userId, rating: Number(rating), title, body, createdAt: now(), helpful: 0 };
    list.push(review);
    DB.reviews.set(productId, list);

    // Update product aggregate
    const product = Products.findById(productId);
    if (product) {
      const allRatings = list.map(r => r.rating);
      const avg = allRatings.reduce((s,r) => s+r, 0) / allRatings.length;
      Products.update(productId, { rating: Math.round(avg * 10) / 10, reviewCount: list.length });
    }
    return review;
  },

  forProduct: (productId) => (DB.reviews.get(productId) || []).map(r => ({
    ...r, user: Users.safe(Users.findById(r.userId)),
  })),

  markHelpful: (productId, reviewId) => {
    const list = DB.reviews.get(productId) || [];
    const r = list.find(r => r.id === reviewId);
    if (r) { r.helpful++; DB.reviews.set(productId, list); }
    return r;
  },
};

/* ──────────────────────────────────────
   REFRESH TOKENS
────────────────────────────────────── */
const RefreshTokens = {
  add:    (token) => DB.refreshTokens.add(token),
  has:    (token) => DB.refreshTokens.has(token),
  remove: (token) => DB.refreshTokens.delete(token),
  clear:  ()      => DB.refreshTokens.clear(),
};

/* ──────────────────────────────────────
   OTP STORE (password reset)
────────────────────────────────────── */
const OTPStore = {
  set: (email, otp) => {
    DB.otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min
  },
  verify: (email, otp) => {
    const entry = DB.otpStore.get(email.toLowerCase());
    if (!entry) return false;
    if (Date.now() > entry.expires) { DB.otpStore.delete(email.toLowerCase()); return false; }
    if (entry.otp !== String(otp)) return false;
    DB.otpStore.delete(email.toLowerCase());
    return true;
  },
};

/* ──────────────────────────────────────
   ANALYTICS
────────────────────────────────────── */
const Analytics = {
  summary: () => ({
    totalUsers:    Users.count(),
    totalProducts: Products.count(),
    totalOrders:   Orders.count(),
    totalRevenue:  Orders.revenue(),
    topProducts:   Products.query({ sortBy:"reviewCount", sortDir:"desc", limit:5 }).data,
    recentOrders:  Orders.all().slice(0, 5),
  }),
};

/* ──────────────────────────────────────
   SEED ON FIRST LOAD
────────────────────────────────────── */
async function seed() {
  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@sgh.com";
  if (!Users.findByEmail(adminEmail)) {
    await Users.create({
      name: "SGH Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "Admin@SGH2024",
      role: "admin",
    });
    console.log(`✔ Admin seeded → ${adminEmail}`);
  }

  // Products
  if (Products.count() === 0) {
    SEED_PRODUCTS.forEach(p => Products.create(p));
    console.log(`✔ ${SEED_PRODUCTS.length} products seeded`);
  }
}

module.exports = { Users, Products, Carts, Wishlists, Orders, Reviews, RefreshTokens, OTPStore, Analytics, seed };
