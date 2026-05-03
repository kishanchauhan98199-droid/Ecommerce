# 📡 Style Gallery Hub — API Documentation

Base URL: `https://your-backend.onrender.com/api`

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "securepass123"
}
```
**Response 201:**
```json
{
  "user": { "_id": "...", "name": "Priya Sharma", "email": "priya@example.com", "role": "user" },
  "token": "eyJhbGc..."
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json

{ "email": "priya@example.com", "password": "securepass123" }
```

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>

{ "name": "Priya S.", "phone": "+91 98765 43210", "password": "newpass" }
```

---

## Products

### List Products
```http
GET /products?keyword=cashmere&category=Women&minPrice=1000&maxPrice=10000&sort=price-asc&page=1&limit=12
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `keyword` | string | Full-text search |
| `category` | string | `Women`, `Men`, `Accessories` |
| `minPrice` | number | Min price filter |
| `maxPrice` | number | Max price filter |
| `sort` | string | `price-asc`, `price-desc`, `rating`, `newest`, `popular` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 12) |

**Response 200:**
```json
{
  "products": [...],
  "total": 48,
  "page": 1,
  "pages": 4
}
```

---

### Get Single Product
```http
GET /products/:id
```

---

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>

{
  "name": "Cashmere Turtleneck",
  "description": "Luxuriously soft 100% cashmere...",
  "price": 4999,
  "originalPrice": 6499,
  "category": "Women",
  "stock": 24,
  "tag": "Bestseller",
  "sku": "SGH-W-001"
}
```

---

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer <admin_token>

{ "price": 4499, "stock": 30 }
```

---

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer <admin_token>
```
*Soft delete — sets `isActive: false`*

---

### Add Review
```http
POST /products/:id/reviews
Authorization: Bearer <token>

{ "rating": 5, "comment": "Absolutely stunning quality!" }
```

---

## Cart

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

---

### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>

{ "productId": "65abc123...", "quantity": 2 }
```

---

### Update Item Quantity
```http
PUT /cart/:productId
Authorization: Bearer <token>

{ "quantity": 3 }
```
*Set quantity to 0 to remove item.*

---

### Remove Item
```http
DELETE /cart/:productId
Authorization: Bearer <token>
```

---

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

---

## Orders

### Place Order
```http
POST /orders
Authorization: Bearer <token>

{
  "orderItems": [
    { "product": "65abc123...", "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "Priya Sharma",
    "street": "123 Fashion Lane",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "+91 98765 43210"
  },
  "paymentMethod": "card"
}
```
*Prices are always verified server-side — client prices are ignored.*

**Response 201:**
```json
{
  "_id": "...",
  "orderNumber": "SGH-00001",
  "status": "Pending",
  "totalPrice": 12158,
  ...
}
```

---

### My Orders
```http
GET /orders/myorders
Authorization: Bearer <token>
```

---

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

---

### All Orders (Admin)
```http
GET /orders?status=Shipped&page=1&limit=20
Authorization: Bearer <admin_token>
```

---

### Update Order Status (Admin)
```http
PUT /orders/:id/status
Authorization: Bearer <admin_token>

{ "status": "Shipped", "trackingNumber": "IN123456789" }
```

Valid statuses: `Pending` → `Confirmed` → `Shipped` → `Delivered` → `Cancelled`

---

## Payments

### Create Stripe Payment Intent
```http
POST /payment/create-intent
Authorization: Bearer <token>

{ "amount": 1215800 }  // in paise (₹12,158 × 100)
```
**Response:**
```json
{ "clientSecret": "pi_xxx_secret_xxx" }
```

---

### Create Razorpay Order
```http
POST /payment/razorpay/create-order
Authorization: Bearer <token>

{ "amount": 1215800 }
```

---

### Verify Razorpay Payment
```http
POST /payment/razorpay/verify
Authorization: Bearer <token>

{
  "razorpay_order_id":   "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature":  "signature_hash"
}
```

---

## Coupons

### Apply Coupon
```http
POST /coupons/apply
Authorization: Bearer <token>

{ "code": "WELCOME10", "cartTotal": 5000 }
```
**Response:**
```json
{
  "valid":       true,
  "code":        "WELCOME10",
  "type":        "percent",
  "value":       10,
  "discount":    500,
  "description": "10% off for new customers"
}
```

---

### Create Coupon (Admin)
```http
POST /coupons
Authorization: Bearer <admin_token>

{
  "code":       "FLAT500",
  "type":       "fixed",
  "value":      500,
  "minOrder":   2000,
  "validUntil": "2024-12-31",
  "usageLimit": 100,
  "userLimit":  1
}
```

---

## Upload

### Upload Image (Admin)
```http
POST /upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

image: <file>   // field name must be "image"
```
**Response:**
```json
{
  "url":      "https://res.cloudinary.com/your_cloud/image/upload/...",
  "publicId": "style-gallery-hub/product_xyz",
  "width":    800,
  "height":   1000
}
```

---

## Error Responses

All errors follow this format:
```json
{ "message": "Human-readable error description" }
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT token |
| 403 | Insufficient permissions (non-admin) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |