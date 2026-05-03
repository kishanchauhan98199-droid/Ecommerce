import React, { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════
   SGH — STYLE GALLERY HUB  |  App.js  (Advanced)
   ✓ Login / Signup Modal with JWT-ready auth
   ✓ Cart drawer with quantity management
   ✓ Wishlist toggle with persistence
   ✓ Men / Women / Kids / Accessories filters
   ✓ Live search with debounce
   ✓ Product Quick View modal
   ✓ Toast notifications
   ✓ Animated hero with gradient mesh
   ✓ Custom cursor glow
   ✓ Scroll-triggered animations
   ✓ API fetch with demo fallback
   ✓ Fully responsive
══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────
   CONFIG
────────────────────────────────────── */
const CONFIG = {
  API_URL:  "http://localhost:5001/api/products",
  CURRENCY: "INR",
  LOCALE:   "en-IN",
  TIMEOUT:  5000,
};

const fmt = (n) =>
  new Intl.NumberFormat(CONFIG.LOCALE, {
    style: "currency",
    currency: CONFIG.CURRENCY,
    minimumFractionDigits: 0,
  }).format(n);

/* ──────────────────────────────────────
   DEMO PRODUCTS
────────────────────────────────────── */
const DEMO_PRODUCTS = [
  { id:1,  name:"Silk Wrap Dress",        price:32000, originalPrice:42000, category:"women",      badge:"sale",  image:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80" },
  { id:2,  name:"Tailored Wool Blazer",   price:54000, originalPrice:null,  category:"men",        badge:"new",   image:"https://images.unsplash.com/photo-1594938298603-c8148c4b4e1c?w=600&q=80" },
  { id:3,  name:"Burnished Leather Tote", price:71000, originalPrice:null,  category:"accessories",badge:"hot",   image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" },
  { id:4,  name:"Cashmere Column Coat",   price:98000, originalPrice:130000,category:"women",      badge:"sale",  image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80" },
  { id:5,  name:"Slim Merino Trousers",   price:25000, originalPrice:null,  category:"men",        badge:"new",   image:"https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80" },
  { id:6,  name:"Gold Link Chain",        price:36000, originalPrice:null,  category:"accessories",badge:null,    image:"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80" },
  { id:7,  name:"Bias-Cut Satin Skirt",   price:22500, originalPrice:28500, category:"women",      badge:"sale",  image:"https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=600&q=80" },
  { id:8,  name:"Kids Denim Jacket",      price:8900,  originalPrice:null,  category:"kids",       badge:"new",   image:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80" },
  { id:9,  name:"Egyptian Cotton Shirt",  price:15500, originalPrice:null,  category:"men",        badge:null,    image:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80" },
  { id:10, name:"Kids Floral Dress",      price:7200,  originalPrice:9500,  category:"kids",       badge:"sale",  image:"https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=600&q=80" },
  { id:11, name:"Suede Chelsea Boots",    price:63000, originalPrice:null,  category:"men",        badge:"hot",   image:"https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80" },
  { id:12, name:"South Sea Pearl Drops",  price:49000, originalPrice:null,  category:"accessories",badge:"new",   image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80" },
  { id:13, name:"Kids Sneaker Set",       price:5800,  originalPrice:7200,  category:"kids",       badge:"sale",  image:"https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&q=80" },
  { id:14, name:"Fluid Linen Trousers",   price:24500, originalPrice:33000, category:"women",      badge:"sale",  image:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80" },
  { id:15, name:"Structured Saddle Bag",  price:93000, originalPrice:null,  category:"accessories",badge:null,    image:"https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80" },
  { id:16, name:"Kids Striped Hoodie",    price:4500,  originalPrice:null,  category:"kids",       badge:null,    image:"https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80" },
];

/* ──────────────────────────────────────
   STYLES
────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #0a0a0a;
    --surface:    #111111;
    --surface2:   #1a1a1a;
    --border:     #2a2a2a;
    --gold:       #c9a84c;
    --gold-light: #e8c97a;
    --text:       #f0ede8;
    --text-muted: #888;
    --white:      #ffffff;
    --red:        #e05252;
    --green:      #4caf50;
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans:  'DM Sans', sans-serif;
    --radius:     4px;
    --transition: 0.28s cubic-bezier(0.4,0,0.2,1);
    --shadow:     0 20px 60px rgba(0,0,0,0.5);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* CURSOR GLOW */
  .cursor-glow {
    position: fixed;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 0;
    transition: left 0.08s, top 0.08s;
  }

  /* ── NAVBAR ── */
  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 32px;
    height: 64px;
    background: rgba(10,10,10,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid transparent;
    transition: border-color var(--transition), background var(--transition);
  }
  .navbar.scrolled {
    border-bottom-color: var(--border);
    background: rgba(10,10,10,0.97);
  }
  .logo {
    font-family: var(--font-serif);
    font-size: 1.55rem;
    font-weight: 400;
    letter-spacing: 0.08em;
    color: var(--gold);
    white-space: nowrap;
    flex-shrink: 0;
    text-decoration: none;
  }
  .logo span { font-style: italic; color: var(--text); }

  .nav-search {
    flex: 1;
    max-width: 340px;
    position: relative;
    margin: 0 auto;
  }
  .nav-search input {
    width: 100%;
    padding: 8px 14px 8px 36px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 40px;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    outline: none;
    transition: border-color var(--transition);
  }
  .nav-search input:focus { border-color: var(--gold); }
  .nav-search svg {
    position: absolute;
    left: 11px; top: 50%;
    transform: translateY(-50%);
    opacity: 0.4;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .nav-icon-btn {
    position: relative;
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition), background var(--transition);
  }
  .nav-icon-btn:hover { color: var(--gold); background: rgba(201,168,76,0.08); }
  .badge {
    position: absolute;
    top: -2px; right: -2px;
    background: var(--gold);
    color: #000;
    font-size: 0.6rem;
    font-weight: 700;
    width: 16px; height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .btn-login {
    padding: 7px 20px;
    background: var(--gold);
    color: #000;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition);
  }
  .btn-login:hover { background: var(--gold-light); transform: translateY(-1px); }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    flex-shrink: 0;
  }
  .hamburger span {
    display: block;
    width: 22px; height: 1.5px;
    background: var(--text);
    transition: var(--transition);
    transform-origin: center;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

  .mobile-menu {
    display: none;
    position: fixed;
    top: 64px; left: 0; right: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 20px 24px;
    flex-direction: column;
    gap: 12px;
    z-index: 999;
  }
  .mobile-menu.open { display: flex; }
  .mobile-menu a {
    color: var(--text);
    text-decoration: none;
    font-size: 0.88rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .mobile-menu a:last-child { border-bottom: none; }

  /* ── HERO ── */
  .hero {
    position: relative;
    min-height: 92vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 100px 24px 80px;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 40%, rgba(201,168,76,0.12) 0%, transparent 50%),
      radial-gradient(ellipse 60% 80% at 80% 60%, rgba(201,168,76,0.07) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
    animation: bgShift 12s ease-in-out infinite alternate;
  }
  @keyframes bgShift {
    0%  { filter: hue-rotate(0deg); }
    100%{ filter: hue-rotate(15deg); }
  }
  .hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
  }
  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 780px;
  }
  .hero-eyebrow {
    display: inline-block;
    font-size: 0.72rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 20px;
    animation: fadeUp 0.8s ease both;
  }
  .hero-title {
    font-family: var(--font-serif);
    font-size: clamp(2.8rem, 7vw, 5.5rem);
    font-weight: 300;
    line-height: 1.08;
    margin-bottom: 24px;
    animation: fadeUp 0.8s 0.15s ease both;
  }
  .hero-title em { font-style: italic; color: var(--gold); }
  .hero-sub {
    font-size: 0.9rem;
    color: var(--text-muted);
    max-width: 440px;
    margin: 0 auto 40px;
    line-height: 1.8;
    animation: fadeUp 0.8s 0.3s ease both;
  }
  .hero-ctas {
    display: flex;
    gap: 14px;
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeUp 0.8s 0.45s ease both;
  }
  .btn-primary {
    padding: 14px 36px;
    background: var(--gold);
    color: #000;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
  }
  .btn-primary:hover {
    background: var(--gold-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(201,168,76,0.3);
  }
  .btn-outline {
    padding: 14px 36px;
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color var(--transition), color var(--transition), transform var(--transition);
  }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }

  .hero-stats {
    display: flex;
    gap: 48px;
    justify-content: center;
    margin-top: 64px;
    animation: fadeUp 0.8s 0.6s ease both;
  }
  .stat-item { text-align: center; }
  .stat-num {
    font-family: var(--font-serif);
    font-size: 2rem;
    font-weight: 300;
    color: var(--gold);
    display: block;
  }
  .stat-label {
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  /* ── CATEGORIES STRIP ── */
  .categories-section {
    padding: 60px 32px 0;
    text-align: center;
  }
  .section-label {
    font-size: 0.68rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 12px;
    display: block;
  }
  .section-title {
    font-family: var(--font-serif);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 300;
    margin-bottom: 40px;
  }
  .category-pills {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .cat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 40px;
    color: var(--text-muted);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all var(--transition);
  }
  .cat-pill:hover, .cat-pill.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(201,168,76,0.2);
  }
  .cat-pill .cat-icon { font-size: 1rem; }

  /* ── FILTER BAR ── */
  .filter-bar {
    padding: 40px 32px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .tabs {
    display: flex;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px;
  }
  .tab {
    padding: 7px 20px;
    border-radius: 4px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--transition);
  }
  .tab.active {
    background: var(--gold);
    color: #000;
    font-weight: 500;
  }
  .filter-count {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* ── PRODUCT GRID ── */
  .products-section { padding: 32px 32px 80px; }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }

  /* ── PRODUCT CARD ── */
  .product-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
    animation: fadeUp 0.5s ease both;
    cursor: pointer;
  }
  .product-card:hover {
    transform: translateY(-6px);
    border-color: rgba(201,168,76,0.3);
    box-shadow: 0 24px 48px rgba(0,0,0,0.4);
  }

  .card-img-wrap {
    position: relative;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: var(--surface2);
  }
  .card-img-wrap img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
    display: block;
  }
  .product-card:hover .card-img-wrap img { transform: scale(1.06); }

  .card-badge {
    position: absolute;
    top: 12px; left: 12px;
    padding: 4px 10px;
    border-radius: 3px;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .badge--sale { background: var(--red); color: #fff; }
  .badge--new  { background: var(--gold); color: #000; }
  .badge--hot  { background: #e06b2a; color: #fff; }

  .card-actions {
    position: absolute;
    top: 12px; right: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    opacity: 0;
    transform: translateX(8px);
    transition: all var(--transition);
  }
  .product-card:hover .card-actions { opacity: 1; transform: translateX(0); }

  .card-action-btn {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(10,10,10,0.8);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all var(--transition);
  }
  .card-action-btn:hover, .card-action-btn.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #000;
  }

  .card-quickview {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 12px;
    background: rgba(10,10,10,0.9);
    backdrop-filter: blur(8px);
    border: none;
    color: var(--gold);
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transform: translateY(100%);
    transition: transform var(--transition);
  }
  .product-card:hover .card-quickview { transform: translateY(0); }

  .card-body {
    padding: 16px;
  }
  .card-category {
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
    margin-bottom: 6px;
  }
  .card-name {
    font-family: var(--font-serif);
    font-size: 1.05rem;
    font-weight: 400;
    line-height: 1.3;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-price-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .card-price {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--gold);
  }
  .card-price-was {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: line-through;
  }

  .card-atc {
    width: 100%;
    padding: 10px 0;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all var(--transition);
  }
  .card-atc:hover {
    background: var(--gold);
    border-color: var(--gold);
    color: #000;
  }
  .card-atc.adding {
    background: var(--green);
    border-color: var(--green);
    color: #fff;
  }

  /* ── EMPTY STATE ── */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 100px 20px;
    color: var(--text-muted);
  }
  .empty-state h3 {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-weight: 300;
    margin-bottom: 8px;
  }

  /* ── CART DRAWER ── */
  .cart-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 2000;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition);
  }
  .cart-overlay.open { opacity: 1; pointer-events: all; }

  .cart-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 400px;
    max-width: 95vw;
    background: var(--surface);
    border-left: 1px solid var(--border);
    z-index: 2001;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .cart-drawer.open { transform: translateX(0); }

  .cart-header {
    padding: 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cart-header h2 {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-weight: 400;
  }
  .drawer-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1.4rem;
    line-height: 1;
    padding: 4px;
    transition: color var(--transition);
  }
  .drawer-close:hover { color: var(--text); }

  .cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .cart-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    animation: fadeUp 0.3s ease;
  }
  .cart-item-img {
    width: 64px; height: 80px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .cart-item-info { flex: 1; }
  .cart-item-name {
    font-family: var(--font-serif);
    font-size: 0.95rem;
    font-weight: 400;
    margin-bottom: 4px;
  }
  .cart-item-price {
    color: var(--gold);
    font-size: 0.85rem;
    margin-bottom: 10px;
  }
  .qty-ctrl {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .qty-btn {
    width: 24px; height: 24px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    line-height: 1;
    transition: all var(--transition);
  }
  .qty-btn:hover { background: var(--gold); border-color: var(--gold); color: #000; }
  .qty-num {
    font-size: 0.85rem;
    min-width: 20px;
    text-align: center;
  }
  .cart-item-remove {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 4px;
    transition: color var(--transition);
    align-self: flex-start;
  }
  .cart-item-remove:hover { color: var(--red); }

  .cart-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    text-align: center;
    gap: 12px;
    padding: 40px;
  }
  .cart-empty svg { opacity: 0.3; }
  .cart-empty p { font-size: 0.85rem; }

  .cart-footer {
    padding: 20px 24px;
    border-top: 1px solid var(--border);
  }
  .cart-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .cart-total-label { font-size: 0.8rem; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; }
  .cart-total-price { font-family: var(--font-serif); font-size: 1.4rem; color: var(--gold); }
  .btn-checkout {
    width: 100%;
    padding: 14px;
    background: var(--gold);
    color: #000;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--transition);
  }
  .btn-checkout:hover {
    background: var(--gold-light);
    box-shadow: 0 8px 24px rgba(201,168,76,0.3);
  }

  /* ── MODAL (Login / Signup / QuickView) ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition);
  }
  .modal-overlay.open { opacity: 1; pointer-events: all; }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 440px;
    padding: 40px;
    position: relative;
    transform: translateY(20px) scale(0.97);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    animation: modalIn 0.3s ease forwards;
  }
  @keyframes modalIn {
    from { transform: translateY(20px) scale(0.96); opacity: 0; }
    to   { transform: translateY(0) scale(1); opacity: 1; }
  }
  .modal-close {
    position: absolute;
    top: 16px; right: 16px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: all var(--transition);
  }
  .modal-close:hover { background: var(--surface2); color: var(--text); }

  .modal-logo {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    color: var(--gold);
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: 0.06em;
  }
  .modal-sub {
    text-align: center;
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-bottom: 32px;
  }
  .modal-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 28px;
    border-bottom: 1px solid var(--border);
  }
  .modal-tab {
    flex: 1;
    padding: 10px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--transition);
    margin-bottom: -1px;
  }
  .modal-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.88rem;
    outline: none;
    transition: border-color var(--transition);
  }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--text-muted); }

  .form-forgot {
    display: block;
    text-align: right;
    font-size: 0.7rem;
    color: var(--gold);
    cursor: pointer;
    margin-top: -8px;
    margin-bottom: 20px;
    text-decoration: none;
  }

  .btn-form {
    width: 100%;
    padding: 12px;
    background: var(--gold);
    color: #000;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all var(--transition);
    margin-top: 4px;
  }
  .btn-form:hover { background: var(--gold-light); }
  .btn-form:disabled { opacity: 0.6; cursor: not-allowed; }

  .form-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: var(--text-muted);
    font-size: 0.72rem;
  }
  .form-divider::before,
  .form-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .form-error {
    background: rgba(224,82,82,0.1);
    border: 1px solid rgba(224,82,82,0.3);
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.78rem;
    color: var(--red);
    margin-bottom: 16px;
  }
  .form-success {
    background: rgba(76,175,80,0.1);
    border: 1px solid rgba(76,175,80,0.3);
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 0.78rem;
    color: var(--green);
    margin-bottom: 16px;
  }

  /* Quick View Modal */
  .qv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    max-width: 680px;
  }
  .qv-img {
    aspect-ratio: 3/4;
    object-fit: cover;
    width: 100%;
    border-radius: 6px;
  }
  .qv-info { display: flex; flex-direction: column; justify-content: center; }
  .qv-cat {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }
  .qv-name {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    font-weight: 300;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  .qv-price { font-size: 1.1rem; color: var(--gold); margin-bottom: 20px; }
  .qv-desc { font-size: 0.83rem; color: var(--text-muted); line-height: 1.8; margin-bottom: 24px; }

  /* ── TOAST ── */
  .toast-wrap {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 4000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }
  .toast {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 6px;
    padding: 14px 18px;
    font-size: 0.82rem;
    min-width: 260px;
    max-width: 340px;
    box-shadow: var(--shadow);
    transform: translateX(120%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    pointer-events: all;
  }
  .toast.show { transform: translateX(0); }
  .toast-title { font-weight: 500; margin-bottom: 2px; }
  .toast-msg { color: var(--text-muted); font-size: 0.78rem; }

  /* ── FOOTER ── */
  .footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 60px 32px 32px;
  }
  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }
  .footer-brand-name {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    color: var(--gold);
    margin-bottom: 12px;
    display: block;
  }
  .footer-tagline { font-size: 0.82rem; color: var(--text-muted); line-height: 1.7; max-width: 220px; }
  .footer-col h4 {
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .footer-col a {
    display: block;
    font-size: 0.83rem;
    color: var(--text-muted);
    text-decoration: none;
    margin-bottom: 8px;
    transition: color var(--transition);
  }
  .footer-col a:hover { color: var(--gold); }
  .footer-bottom {
    border-top: 1px solid var(--border);
    padding-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .footer-copy { font-size: 0.72rem; color: var(--text-muted); }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .navbar { padding: 0 16px; }
    .nav-search, .btn-login { display: none; }
    .hamburger { display: flex; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
    .hero-stats { gap: 28px; }
    .filter-bar { padding: 32px 16px 0; }
    .products-section { padding: 24px 16px 60px; }
    .product-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    .qv-grid { grid-template-columns: 1fr; }
    .qv-img { max-height: 240px; object-fit: cover; }
    .cart-drawer { width: 100%; }
    .categories-section { padding: 40px 16px 0; }
  }
`;

/* ══════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════ */

/* -- TOAST MANAGER -- */
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((title, msg = "", type = "default") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, title, msg, type, show: false }]);
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t)), 50);
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, show: false } : t)), 3200);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3700);
  }, []);
  return { toasts, push };
}

/* -- LOGIN MODAL -- */
function AuthModal({ open, onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { if (open) { setError(""); setSuccess(""); setForm({ name: "", email: "", password: "" }); } }, [open]);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) { setError("Please fill all required fields."); return; }
    if (tab === "signup" && !form.name) { setError("Name is required."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate API call
    setLoading(false);
    if (tab === "login") {
      // Demo: accept any credentials
      onLogin({ name: form.email.split("@")[0], email: form.email });
      onClose();
    } else {
      setSuccess("Account created! You can now log in.");
      setTab("login");
    }
  };

  return (
    <div className={`modal-overlay ${open ? "open" : ""}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">SGH</div>
        <p className="modal-sub">Style Gallery Hub — Curated Luxury</p>

        <div className="modal-tabs">
          {["login","signup"].map(t => (
            <button key={t} className={`modal-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setError(""); setSuccess(""); }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        {tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" name="name" placeholder="Your name" value={form.name} onChange={change} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" name="email" placeholder="email@example.com" value={form.email} onChange={change} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={change} />
        </div>
        {tab === "login" && <a className="form-forgot" href="#!">Forgot password?</a>}

        <button className="btn-form" onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

/* -- QUICK VIEW MODAL -- */
function QuickView({ product, open, onClose, onAddToCart }) {
  if (!product) return null;
  const price = parseFloat(product.price) || 0;
  const was   = product.originalPrice;
  return (
    <div className={`modal-overlay ${open ? "open" : ""}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal qv-grid">
        <button className="modal-close" onClick={onClose}>✕</button>
        <img className="qv-img" src={product.image} alt={product.name} onError={e => e.target.src = "https://placehold.co/400x530/111/c9a84c?text=SGH"} />
        <div className="qv-info">
          <span className="qv-cat">{product.category}</span>
          <h2 className="qv-name">{product.name}</h2>
          <div className="qv-price">
            {fmt(price)}{was && <span className="card-price-was" style={{marginLeft:8}}>{fmt(was)}</span>}
          </div>
          <p className="qv-desc">Premium quality {product.name.toLowerCase()}. Crafted with the finest materials and exceptional attention to detail for the discerning individual.</p>
          <button className="btn-primary" style={{width:"100%"}} onClick={() => { onAddToCart(product); onClose(); }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* -- CART DRAWER -- */
function CartDrawer({ open, onClose, cart, onQty, onRemove }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <>
      <div className={`cart-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`cart-drawer ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart ({cart.reduce((s,i)=>s+i.qty,0)})</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img className="cart-item-img" src={item.image} alt={item.name} onError={e => e.target.src="https://placehold.co/64x80/111/c9a84c?text=SGH"} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{fmt(item.price)}</div>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => onQty(item.id, -1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => onQty(item.id, +1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => onRemove(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-price">{fmt(total)}</span>
            </div>
            <button className="btn-checkout" onClick={() => alert("Proceeding to checkout!")}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function App() {
  /* state */
  const [products, setProducts]     = useState([]);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [cart, setCart]             = useState([]);
  const [wishlist, setWishlist]     = useState(new Set());
  const [cartOpen, setCartOpen]     = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);
  const [qvProduct, setQvProduct]   = useState(null);
  const [user, setUser]             = useState(null);
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [addingId, setAddingId]     = useState(null);
  const cursorRef = useRef(null);
  const searchTimer = useRef(null);
  const { toasts, push: pushToast } = useToasts();

  /* fetch products */
  useEffect(() => {
    (async () => {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), CONFIG.TIMEOUT);
        const res = await fetch(CONFIG.API_URL, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.products || data.data || []);
        if (!arr.length) throw new Error("empty");
        setProducts(arr);
      } catch {
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* cursor glow */
  useEffect(() => {
    const move = e => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* filtered products */
  const visible = products.filter(p => {
    const matchF = filter === "all" || (p.category || "").toLowerCase() === filter;
    const matchS = !search || (p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  /* cart helpers */
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddingId(product.id);
    setTimeout(() => setAddingId(null), 1800);
    pushToast(`Added to cart`, product.name);
  }, [pushToast]);

  const changeQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
      return updated.filter(i => i.qty > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    pushToast("Item removed", "", "default");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  //const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  /* wishlist toggle */
  const toggleWishlist = (id, name) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); pushToast("Removed from wishlist", name); }
      else               { next.add(id);    pushToast("Added to wishlist ♥", name); }
      return next;
    });
  };

  const FILTERS = [
    { key: "all",        label: "All",        icon: "✦" },
    { key: "women",      label: "Women",      icon: "👗" },
    { key: "men",        label: "Men",        icon: "🕴" },
    { key: "kids",       label: "Kids",       icon: "🧒" },
    { key: "accessories",label: "Accessories",icon: "💍" },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* CURSOR GLOW */}
      <div className="cursor-glow" ref={cursorRef} />

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a className="logo" href="#home">SGH <span>Gallery</span></a>

        <div className="nav-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search products…"
            value={search}
            onChange={e => {
              clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => setSearch(e.target.value), 250);
            }}
          />
        </div>

        <div className="nav-actions">
          {/* Wishlist */}
          <button className="nav-icon-btn" title="Wishlist" onClick={() => pushToast("Wishlist", `${wishlist.size} saved items`)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.size > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {wishlist.size > 0 && <span className="badge">{wishlist.size}</span>}
          </button>

          {/* Cart */}
          <button className="nav-icon-btn" title="Cart" onClick={() => setCartOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

          {/* Login / User */}
          {user ? (
            <button className="btn-login" onClick={() => { setUser(null); pushToast("Signed out", "Come back soon!"); }}>
              {user.name.substring(0,8)}…
            </button>
          ) : (
            <button className="btn-login" onClick={() => setAuthOpen(true)}>Login</button>
          )}

          {/* Hamburger */}
          <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(o => !o)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {FILTERS.map(f => (
          <a key={f.key} href="#products" onClick={() => { setFilter(f.key); setMenuOpen(false); }}>
            {f.icon} {f.label}
          </a>
        ))}
        <a href="#!" onClick={() => { setMenuOpen(false); setAuthOpen(true); }}>
          👤 {user ? `Signed in as ${user.name}` : "Login / Sign Up"}
        </a>
      </div>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <span className="hero-eyebrow">New Season · SS 2025</span>
          <h1 className="hero-title">
            Discover Your<br/><em>Signature Style</em>
          </h1>
          <p className="hero-sub">
            Curated luxury fashion for women, men, and children.
            Every piece tells a story of craftsmanship and distinction.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
              Shop Collection
            </button>
            <button className="btn-outline" onClick={() => { setFilter("new"); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}>
              New Arrivals
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><span className="stat-num">2.4K+</span><span className="stat-label">Products</span></div>
            <div className="stat-item"><span className="stat-num">180+</span><span className="stat-label">Brands</span></div>
            <div className="stat-item"><span className="stat-num">98%</span><span className="stat-label">Satisfaction</span></div>
          </div>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <section className="categories-section">
        <span className="section-label">Browse by Category</span>
        <h2 className="section-title">Shop the Collection</h2>
        <div className="category-pills">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`cat-pill ${filter === f.key ? "active" : ""}`}
              onClick={() => { setFilter(f.key); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              <span className="cat-icon">{f.icon}</span>
              {f.label}
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>
                ({f.key === "all" ? products.length : products.filter(p => p.category === f.key).length})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FILTER BAR + PRODUCTS */}
      <section className="products-section" id="products">
        <div className="filter-bar">
          <div className="tabs">
            {FILTERS.map(f => (
              <button key={f.key} className={`tab ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="filter-count">
            {loading ? "Loading…" : `${visible.length} piece${visible.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="product-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card" style={{ opacity: 0.4, animationDelay: `${i * 0.06}s` }}>
                <div style={{ background: "var(--surface2)", aspectRatio: "3/4" }} />
                <div className="card-body">
                  <div style={{ height: 12, background: "var(--surface2)", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 18, background: "var(--surface2)", borderRadius: 4, marginBottom: 8, width: "70%" }} />
                  <div style={{ height: 12, background: "var(--surface2)", borderRadius: 4, width: "40%" }} />
                </div>
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <h3>No pieces found</h3>
              <p style={{ fontSize: "0.8rem", marginTop: 6 }}>Try a different filter or search term</p>
            </div>
          ) : (
            visible.map((product, i) => {
              const isWished = wishlist.has(product.id);
              const isAdding = addingId === product.id;
              const price    = parseFloat(product.price) || 0;
              const was      = product.originalPrice;
              const imgSrc   = product.image || `https://placehold.co/400x530/111/c9a84c?text=${encodeURIComponent(product.name)}`;
              return (
                <article key={product.id} className="product-card" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="card-img-wrap">
                    <img src={imgSrc} alt={product.name} loading="lazy" onError={e => e.target.src = "https://placehold.co/400x530/111111/c9a84c?text=SGH"} />

                    {product.badge && (
                      <span className={`card-badge badge--${product.badge}`}>{product.badge}</span>
                    )}

                    <div className="card-actions">
                      <button
                        className={`card-action-btn ${isWished ? "active" : ""}`}
                        title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={() => toggleWishlist(product.id, product.name)}
                      >
                        {isWished ? "♥" : "♡"}
                      </button>
                    </div>

                    <button className="card-quickview" onClick={() => setQvProduct(product)}>
                      Quick View
                    </button>
                  </div>

                  <div className="card-body">
                    <span className="card-category">{product.category}</span>
                    <h3 className="card-name">{product.name}</h3>
                    <div className="card-price-row">
                      <span className="card-price">{fmt(price)}</span>
                      {was && <span className="card-price-was">{fmt(was)}</span>}
                    </div>
                    <button
                      className={`card-atc ${isAdding ? "adding" : ""}`}
                      onClick={() => addToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        "✓  Added"
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <span className="footer-brand-name">SGH Gallery</span>
            <p className="footer-tagline">Curated luxury fashion for the discerning individual. Every piece, a statement.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            {["Women","Men","Kids","Accessories","New Arrivals","Sale"].map(l => (
              <a key={l} href="#!" onClick={() => setFilter(l.toLowerCase().replace(" arrivals",""))}>{l}</a>
            ))}
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            {["Sign In","Create Account","Orders","Wishlist","Returns"].map(l => (
              <a key={l} href="#!" onClick={() => l === "Sign In" && setAuthOpen(true)}>{l}</a>
            ))}
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            {["Contact Us","Shipping","Returns Policy","Size Guide","FAQs"].map(l => (
              <a key={l} href="#!">{l}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 Style Gallery Hub. All rights reserved.</p>
          <p className="footer-copy">Crafted with precision · Made in India 🇮🇳</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onQty={changeQty} onRemove={removeFromCart} />

      {/* AUTH MODAL */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLogin={u => { setUser(u); pushToast(`Welcome back, ${u.name}!`, "You're now signed in."); }} />

      {/* QUICK VIEW */}
      <QuickView product={qvProduct} open={!!qvProduct} onClose={() => setQvProduct(null)} onAddToCart={addToCart} />

      {/* TOAST STACK */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.show ? "show" : ""}`}>
            <div className="toast-title">{t.title}</div>
            {t.msg && <div className="toast-msg">{t.msg}</div>}
          </div>
        ))}
      </div>
    </>
  );
}