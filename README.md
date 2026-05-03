# 🛍️ Style Gallery Hub

> A full-stack, production-ready e-commerce platform for fashion retail — built with React, Node.js, Express, and MongoDB.

![Style Gallery Hub](https://via.placeholder.com/1200x400/0f0f0f/b8860b?text=Style+Gallery+Hub)

---

## ✨ Features

### Customer Features
| Feature | Details |
|---|---|
| 🔐 Authentication | JWT login/register with bcrypt password hashing |
| 🏠 Home Page | Hero banner, featured products, categories, promotions |
| 🛍️ Product Catalog | Search, filter by category/price, sort, pagination |
| 📄 Product Detail | Image gallery, reviews, ratings, quantity selector, wishlist |
| 🛒 Shopping Cart | Add/remove/update, persistent (localStorage for guests) |
| 💳 Checkout | 3-step flow: Address → Payment → Review |
| 💰 Payments | Stripe (card), Razorpay (UPI), Cash on Delivery |
| 📦 Orders | Order history with live status tracking |
| ♡ Wishlist | Save favorites, synced to account |
| 📱 Responsive | Mobile-first design, works on all screen sizes |

### Admin Features
| Feature | Details |
|---|---|
| 📊 Dashboard | Revenue stats, order summary, product analytics |
| 📦 Products | Full CRUD — add, edit, delete with image upload (Cloudinary) |
| 🛍️ Orders | View all orders, update status (Pending → Shipped → Delivered) |
| 👥 Users | View registered users, activate/deactivate accounts |
| 📸 Images | Drag-and-drop Cloudinary upload with auto-optimization |

---

## 🗂️ Project Structure

```
style-gallery-hub/
├── client/                         # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Modal, Toast, Spinner, Pagination, etc.
│   │   │   ├── layout/             # Navbar, Footer
│   │   │   ├── product/            # ProductCard
│   │   │   └── checkout/           # StripePayment, RazorpayButton
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global auth state + JWT
│   │   │   ├── CartContext.jsx     # Cart state with server sync
│   │   │   └── WishlistContext.jsx # Wishlist with persistence
│   │   ├── hooks/
│   │   │   └── index.js            # useProducts, useDebounce, useClickOutside
│   │   ├── pages/
│   │   │   ├── AllPages.jsx        # Home, Products, Detail, Cart, Orders...
│   │   │   ├── AdminPanel.jsx      # Full admin dashboard
│   │   │   └── CheckoutPage.jsx    # Multi-step checkout
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + all API calls
│   │   ├── utils/
│   │   │   └── index.js            # Formatters, validators, constants
│   │   ├── styles/
│   │   │   └── globals.css         # Design system, CSS variables
│   │   └── App.jsx                 # Root component + routing
│   ├── .env.example
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── cartController.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect + admin guard
│   │   └── security.js            # Helmet, rate limiting, sanitization
│   ├── models/
│   │   ├── User.js                 # bcrypt, role, wishlist
│   │   ├── Product.js              # full-text search, reviews, rating
│   │   ├── Order.js                # auto order number, status lifecycle
│   │   └── Cart.js                 # per-user cart
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── userRoutes.js
│   │   ├── uploadRoutes.js         # Cloudinary image upload
│   │   └── paymentRoutes.js        # Stripe + Razorpay
│   ├── scripts/
│   │   └── seed.js                 # Database seeder with sample data
│   ├── tests/
│   │   └── api.test.js             # Jest integration tests
│   ├── utils/
│   │   └── sendEmail.js            # Nodemailer order confirmation emails
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── vercel.json                     # Frontend deployment config
├── render.yaml                     # Backend deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/style-gallery-hub.git
cd style-gallery-hub

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Server
cd server
cp .env.example .env
# Edit .env and fill in your values (at minimum: MONGO_URI, JWT_SECRET)

# Client
cd ../client
cp .env.example .env.local
# Edit .env.local (REACT_APP_STRIPE_PUBLIC_KEY if using Stripe)
```

**Minimum required `.env` values for development:**
```env
MONGO_URI=mongodb://localhost:27017/style-gallery-hub
JWT_SECRET=any-long-random-string-at-least-32-chars
```

### 3. Seed the Database

```bash
cd server
npm run seed
# Creates 12 products + 3 demo users + 2 sample orders
```

### 4. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev       # uses nodemon for hot reload

# Terminal 2 — Frontend (port 3000)
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@sgh.com | admin123 |
| User  | user@sgh.com  | user123  |

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| GET  | `/auth/me` | ✓ | Get current user |
| PUT  | `/auth/profile` | ✓ | Update profile / password |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET  | `/products` | — | List products (search, filter, sort, paginate) |
| GET  | `/products/:id` | — | Get single product |
| POST | `/products` | Admin | Create product |
| PUT  | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete product |
| POST | `/products/:id/reviews` | ✓ | Add review |

**Query params for GET /products:**
```
?keyword=cashmere    # full-text search
&category=Women      # filter
&minPrice=1000       # price range
&maxPrice=10000
&sort=price-asc      # price-asc | price-desc | rating | newest | popular
&page=2              # pagination
&limit=12
```

### Cart
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET    | `/cart` | ✓ | Get user's cart |
| POST   | `/cart/add` | ✓ | Add item |
| PUT    | `/cart/:productId` | ✓ | Update quantity |
| DELETE | `/cart/:productId` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | ✓ | Place order (validates prices server-side) |
| GET  | `/orders/myorders` | ✓ | Get current user's orders |
| GET  | `/orders/:id` | ✓ | Get order by ID |
| GET  | `/orders` | Admin | Get all orders |
| PUT  | `/orders/:id/status` | Admin | Update order status |

### Payment
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payment/create-intent` | ✓ | Create Stripe PaymentIntent |
| POST | `/payment/razorpay/create-order` | ✓ | Create Razorpay order |
| POST | `/payment/razorpay/verify` | ✓ | Verify Razorpay signature |
| POST | `/payment/webhook` | — | Stripe webhook handler |

### Upload
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST   | `/upload` | Admin | Upload image to Cloudinary |
| DELETE | `/upload/:publicId` | Admin | Delete image from Cloudinary |

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from /client
cd client
npm run build
vercel --prod

# Set environment variable in Vercel dashboard:
# REACT_APP_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. **Build Command:** `npm install`
6. **Start Command:** `node server.js`
7. Add all environment variables from `.env.example`

### Database → MongoDB Atlas

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create database user with read/write permissions
4. Whitelist `0.0.0.0/0` in Network Access (for Render)
5. Copy connection string to `MONGO_URI` in your `.env`

---

## 🧪 Testing

```bash
cd server

# Run all tests
npm test

# With coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch
```

Tests cover:
- Auth (register, login, profile)
- Products (CRUD, filtering, pagination)
- Cart (add, update, remove)
- Orders (place, list, status update)
- Admin guards (403 without admin role)

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with salt factor 12 |
| JWT authentication | 30-day tokens, stored in localStorage |
| Rate limiting | 200 req/15min (API), 20 req/15min (auth) |
| NoSQL injection | express-mongo-sanitize |
| XSS protection | xss-clean middleware |
| Security headers | helmet.js (CSP, HSTS, X-Frame-Options) |
| CORS | Configured to allow only CLIENT_URL |
| Input validation | express-validator on all write endpoints |
| Price verification | All prices re-fetched from DB on order creation |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router 6, CSS3 (custom design system) |
| **Backend** | Node.js 18, Express 4 |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Payments** | Stripe, Razorpay |
| **Images** | Cloudinary |
| **Email** | Nodemailer |
| **Security** | Helmet, express-rate-limit, mongo-sanitize, xss-clean |
| **Testing** | Jest + Supertest |
| **Deploy** | Vercel (client) + Render (server) + MongoDB Atlas |

---

## 📄 License

MIT © 2024 Style Gallery Hub