/**
 * Seed Script — Style Gallery Hub
 * Usage: node scripts/seed.js
 * Add --destroy flag to wipe the DB first: node scripts/seed.js --destroy
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Import models
const User    = require('../.models/User');
const Product = require('../.models/Product');
const Order   = require('../.models/Order');

// ── Sample Data ────────────────────────────────────────

const USERS = [
  {
    name:     'Admin User',
    email:    'admin@sgh.com',
    password: 'admin123',
    role:     'admin',
    phone:    '+91 98765 00000',
  },
  {
    name:     'Priya Sharma',
    email:    'user@sgh.com',
    password: 'user123',
    role:     'user',
    phone:    '+91 98765 43210',
  },
  {
    name:     'Rahul Kumar',
    email:    'rahul@example.com',
    password: 'rahul123',
    role:     'user',
    phone:    '+91 91234 56789',
  },
];

const PRODUCTS = [
  {
    name:         'Cashmere Turtleneck',
    description:  'Luxuriously soft 100% Grade-A Mongolian cashmere turtleneck in a relaxed silhouette. Offers exceptional warmth without bulk. Dry flat to maintain shape.',
    price:        4999,
    originalPrice:6499,
    category:     'Women',
    stock:        24,
    tag:          'Bestseller',
    brand:        'SGH Studio',
    sku:          'SGH-W-001',
    image:        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    rating:       4.8,
    numReviews:   124,
  },
  {
    name:         'Leather Oxford Shoes',
    description:  'Handcrafted full-grain English leather oxfords with Goodyear welted construction. Blake-stitched for flexibility. Leather sole with rubber heel cap.',
    price:        8499,
    category:     'Men',
    stock:        16,
    tag:          'New',
    brand:        'Craftsman Co.',
    sku:          'SGH-M-001',
    image:        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800',
    rating:       4.9,
    numReviews:   87,
  },
  {
    name:         'Silk Wrap Dress',
    description:  'Fluid 100% silk wrap dress that drapes beautifully on any figure. Self-tie waist belt. Hand wash cold or dry clean. Available in ivory and deep navy.',
    price:        6299,
    originalPrice:7999,
    category:     'Women',
    stock:        18,
    tag:          'Sale',
    brand:        'SGH Studio',
    sku:          'SGH-W-002',
    image:        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    rating:       4.7,
    numReviews:   203,
  },
  {
    name:         'Italian Wool Blazer',
    description:  'Tailored from superfine Vitale Barberis Canonico wool. Slim two-button silhouette with notched lapels, double vent, and working button cuffs.',
    price:        11999,
    category:     'Men',
    stock:        10,
    tag:          null,
    brand:        'Atelier SGH',
    sku:          'SGH-M-002',
    image:        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
    rating:       4.6,
    numReviews:   56,
  },
  {
    name:         'Linen Summer Shirt',
    description:  'Breathable enzyme-washed linen shirt with a relaxed fit. Two-button cuffs, chest pocket, and a subtly textured finish that improves with every wash.',
    price:        2999,
    category:     'Men',
    stock:        32,
    tag:          'New',
    brand:        'SGH Basics',
    sku:          'SGH-M-003',
    image:        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    rating:       4.5,
    numReviews:   91,
  },
  {
    name:         'Structured Leather Handbag',
    description:  'Pebbled Nappa leather structured tote with 14-carat gold-tone hardware. Interior zip pocket plus two slip pockets. Detachable shoulder strap (120 cm).',
    price:        15999,
    originalPrice:18999,
    category:     'Accessories',
    stock:        8,
    tag:          'Bestseller',
    brand:        'Atelier SGH',
    sku:          'SGH-A-001',
    image:        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    rating:       4.9,
    numReviews:   341,
  },
  {
    name:         'Fine Merino Crewneck',
    description:  'Extra-fine 17.5-micron merino crewneck. Knitted on 12-gauge machines for a lightweight, breathable fabric. Machine washable on wool setting.',
    price:        3799,
    originalPrice:4999,
    category:     'Women',
    stock:        28,
    tag:          'Sale',
    brand:        'SGH Basics',
    sku:          'SGH-W-003',
    image:        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    rating:       4.4,
    numReviews:   89,
  },
  {
    name:         'Full-Grain Leather Belt',
    description:  'Hand-burnished full-grain vegetable-tanned leather belt. Solid brass roller buckle. 3.5 cm width. Available in sizes 28–44 inches.',
    price:        1999,
    category:     'Accessories',
    stock:        45,
    tag:          null,
    brand:        'Craftsman Co.',
    sku:          'SGH-A-002',
    image:        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    rating:       4.7,
    numReviews:   178,
  },
  {
    name:         'Stretch Slim Chinos',
    description:  'Four-way stretch twill chinos with a modern tapered leg. Moisture-wicking lining. Wrinkle-resistant. YKK zip fly. Available in 8 colours.',
    price:        3499,
    category:     'Men',
    stock:        36,
    tag:          null,
    brand:        'SGH Basics',
    sku:          'SGH-M-004',
    image:        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    rating:       4.3,
    numReviews:   112,
  },
  {
    name:         'Gabardine Trench Coat',
    description:  'Classic double-breasted trench in water-resistant Egyptian cotton gabardine. Storm flap, epaulettes, and adjustable belt. Removable wool liner.',
    price:        18999,
    originalPrice:22999,
    category:     'Women',
    stock:        6,
    tag:          'Bestseller',
    brand:        'Atelier SGH',
    sku:          'SGH-W-004',
    image:        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
    rating:       4.9,
    numReviews:   267,
  },
  {
    name:         'Acetate Sunglasses',
    description:  'Handmade Italian acetate frame with polarised CR-39 UV400 lenses. Spring-loaded stainless steel hinges. Comes with hand-stitched leather case.',
    price:        5499,
    category:     'Accessories',
    stock:        20,
    tag:          'New',
    brand:        'Atelier SGH',
    sku:          'SGH-A-003',
    image:        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
    rating:       4.6,
    numReviews:   145,
  },
  {
    name:         'Premium Leather Sneakers',
    description:  'Full-grain nappa leather cupsole sneaker. Padded collar and tongue. Removable cork-latex insole. Vulcanised rubber outsole for grip and durability.',
    price:        7999,
    originalPrice:9499,
    category:     'Men',
    stock:        14,
    tag:          'Sale',
    brand:        'Craftsman Co.',
    sku:          'SGH-M-005',
    image:        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    rating:       4.5,
    numReviews:   198,
  },
];

// ── Connect & Seed ─────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    if (process.argv.includes('--destroy')) {
      await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
      console.log('🗑  Cleared all collections');
    }

    // Seed users (hash passwords)
    const createdUsers = await Promise.all(
      USERS.map(async u => {
        const exists = await User.findOne({ email: u.email });
        if (exists) { console.log(`  ⚠ User ${u.email} already exists, skipping`); return exists; }
        const hashed = await bcrypt.hash(u.password, 12);
        return User.create({ ...u, password: hashed });
      })
    );
    console.log(`👥 Seeded ${createdUsers.length} users`);

    // Seed products
    const insertedProducts = [];
    for (const p of PRODUCTS) {
      const exists = await Product.findOne({ sku: p.sku });
      if (exists) { console.log(`  ⚠ Product ${p.sku} exists, skipping`); insertedProducts.push(exists); continue; }
      const product = await Product.create(p);
      insertedProducts.push(product);
    }
    console.log(`📦 Seeded ${insertedProducts.length} products`);

    // Seed sample orders for user
    const user     = createdUsers.find(u => u.role === 'user');
    const orderCount = await Order.countDocuments({ user: user._id });

    if (orderCount === 0) {
      await Order.create([
        {
          user: user._id,
          orderItems: [
            { product: insertedProducts[0]._id, name: insertedProducts[0].name, image: insertedProducts[0].image, price: insertedProducts[0].price, quantity: 2 },
            { product: insertedProducts[7]._id, name: insertedProducts[7].name, image: insertedProducts[7].image, price: insertedProducts[7].price, quantity: 1 },
          ],
          shippingAddress: { fullName: user.name, street: '123 Fashion Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: user.phone },
          paymentMethod:   'card',
          paymentResult:   { id: 'pi_test_001', status: 'succeeded' },
          itemsPrice:      insertedProducts[0].price * 2 + insertedProducts[7].price,
          shippingPrice:   0,
          taxPrice:        Math.round((insertedProducts[0].price * 2 + insertedProducts[7].price) * 0.18),
          totalPrice:      Math.round((insertedProducts[0].price * 2 + insertedProducts[7].price) * 1.18),
          status:          'Delivered',
          isPaid:          true,
          paidAt:          new Date('2024-01-15'),
          isDelivered:     true,
          deliveredAt:     new Date('2024-01-19'),
        },
        {
          user: user._id,
          orderItems: [
            { product: insertedProducts[2]._id, name: insertedProducts[2].name, image: insertedProducts[2].image, price: insertedProducts[2].price, quantity: 1 },
          ],
          shippingAddress: { fullName: user.name, street: '123 Fashion Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: user.phone },
          paymentMethod:   'upi',
          itemsPrice:      insertedProducts[2].price,
          shippingPrice:   0,
          taxPrice:        Math.round(insertedProducts[2].price * 0.18),
          totalPrice:      Math.round(insertedProducts[2].price * 1.18),
          status:          'Shipped',
          isPaid:          true,
          paidAt:          new Date('2024-01-22'),
        },
      ]);
      console.log('🛍  Seeded 2 sample orders');
    }

    console.log('\n✨ Seed complete!\n');
    console.log('Demo login credentials:');
    console.log('  Admin: admin@sgh.com / admin123');
    console.log('  User:  user@sgh.com  / user123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();