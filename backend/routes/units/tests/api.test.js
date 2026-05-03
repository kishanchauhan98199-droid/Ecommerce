/**
 * server/tests/api.test.js
 * Integration tests for Auth, Product, and Order APIs
 * Run with: npm test
 */

const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../server');   // export app from server.js for testing
const User     = require('../models/User');
const Product  = require('../models/Product');

// ── Test data ─────────────────────────────────────────────────
const testUser = {
  name:     'Test User',
  email:    `test_${Date.now()}@sgh.com`,
  password: 'testpass123',
};
const adminUser = {
  name:     'Admin',
  email:    `admin_${Date.now()}@sgh.com`,
  password: 'adminpass123',
  role:     'admin',
};
const sampleProduct = {
  name:        'Test Shirt',
  description: 'A high-quality test shirt made for testing.',
  price:       2999,
  category:    'Men',
  stock:       20,
  sku:         `TEST-${Date.now()}`,
};

let userToken, adminToken, productId, orderId;

// ── Setup / Teardown ──────────────────────────────────────────
beforeAll(async () => {
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://localhost:27017/sgh_test';
  }
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: { $in: [testUser.email, adminUser.email] } });
  await Product.deleteMany({ sku: sampleProduct.sku });
  await mongoose.connection.close();
});

// ── Auth Tests ────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    userToken = res.body.token;
  });

  it('should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already/i);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@y.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return user profile with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ── Product Tests ─────────────────────────────────────────────
describe('GET /api/products', () => {
  it('should return products array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
  });

  it('should filter by category', async () => {
    const res = await request(app).get('/api/products?category=Women');
    expect(res.statusCode).toBe(200);
    res.body.products.forEach(p => expect(p.category).toBe('Women'));
  });

  it('should sort by price ascending', async () => {
    const res = await request(app).get('/api/products?sort=price-asc&limit=5');
    expect(res.statusCode).toBe(200);
    const prices = res.body.products.map(p => p.price);
    expect(prices).toEqual([...prices].sort((a,b) => a - b));
  });

  it('should paginate results', async () => {
    const res = await request(app).get('/api/products?page=1&limit=4');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeLessThanOrEqual(4);
  });
});

// Admin product tests — need admin token first
describe('Product CRUD (admin)', () => {
  beforeAll(async () => {
    // Promote the test user to admin directly
    await User.findOneAndUpdate({ email: testUser.email }, { role: 'admin' });
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    adminToken = res.body.token;
  });

  it('should create a product as admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(sampleProduct.name);
    productId = res.body._id;
  });

  it('should get product by ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 3499 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(3499);
  });

  it('should reject product creation without admin token', async () => {
    await User.findOneAndUpdate({ email: testUser.email }, { role: 'user' });
    const loginRes = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const userOnlyToken = loginRes.body.token;
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userOnlyToken}`)
      .send(sampleProduct);
    expect(res.statusCode).toBe(403);
  });
});

// ── Cart Tests ─────────────────────────────────────────────────
describe('Cart API', () => {
  it('should get empty cart for new user', async () => {
    const res = await request(app).get('/api/cart').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('should add item to cart', async () => {
    if (!productId) return;
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(200);
    const item = res.body.items.find(i => i.product.toString() === productId || i.product?._id === productId);
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
  });
});

// ── Health Check ───────────────────────────────────────────────
describe('GET /api/health', () => {
  it('should return OK status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});