import React, { useEffect } from 'react';
import './style.css';
import { useState, useEffect } from 'react';
import './styles/globals.css';
import { HomePage, ProductsPage, ProductDetailPage, CartPage, OrdersPage, WishlistPage, LoginPage, formatPrice } from './pages/AllPages';
import CheckoutPage from './pages/CheckoutPage';
import AdminPanel from './pages/AdminPanel';

// ──────────────────────────────────────────────────────
// Simple client-side router (no react-router-dom needed
// for this standalone build — swap in <BrowserRouter>
// when integrating with the full React setup)
// ──────────────────────────────────────────────────────

const INIT_ORDERS = [
  { id:'SGH-00001', date:'2024-01-15', status:'Delivered', total:13298, items:[{ name:'Cashmere Turtleneck', emoji:'🧥', qty:2 },{ name:'Leather Belt', emoji:'⌚', qty:1 }] },
  { id:'SGH-00002', date:'2024-01-22', status:'Shipped',   total:6299,  items:[{ name:'Silk Wrap Dress',    emoji:'👗', qty:1 }] },
];

export default function App() {
  const [page,     setPage]     = useState('home');
  const [pageData, setPageData] = useState({});
  const [cart,     setCart]     = useState([]);
  const [orders,   setOrders]   = useState(INIT_ORDERS);
  const [wishlist, setWishlist] = useState([]);
  const [user,     setUser]     = useState(null);
  const [toast,    setToast]    = useState(null);
  const toastRef = { current: null };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  };

  const navigate = (p, data = {}) => {
    setPage(p);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === (product._id || product.id));
      if (existing) return prev.map(i => i.id === (product._id || product.id) ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, id: product._id || product.id, qty: 1 }];
    });
    showToast(`${product.name} added to cart 🛍️`);
  };

  const updateCart = (id, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.id !== id));
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    showToast('Item removed from cart');
  };

  const toggleWishlist = (product) => {
    const id = product._id || product.id || product;
    const inList = wishlist.includes(id);
    setWishlist(prev => inList ? prev.filter(x => x !== id) : [...prev, id]);
    showToast(inList ? 'Removed from wishlist' : '♥ Added to wishlist');
  };

  const handlePlaceOrder = ({ form, cart, total }) => {
    const newOrder = {
      id: `SGH-${String(orders.length + 3).padStart(5,'0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      total,
      items: cart.map(i => ({ name: i.name, emoji: i.emoji || '📦', qty: i.qty })),
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    showToast('🎉 Order placed successfully!');
    navigate('orders');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Welcome${userData.name ? `, ${userData.name}` : ''}!`);
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out successfully');
    navigate('home');
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Navbar
  const Navbar = () => {
    const [searchVal, setSearchVal] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);

    const handleSearch = (e) => {
      e.preventDefault();
      if (searchVal.trim()) navigate('products', { search: searchVal.trim() });
    };
    useEffect(() => {
  const cursorGlow = document.getElementById('cursorGlow');

  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top  = e.clientY + 'px';
    });
  }
}, []);

    return (
      
      <nav style={{ background:'var(--dark)', position:'sticky', top:0, zIndex:200, borderBottom:'1px solid var(--dark-3)' }}>
        <div style={{ maxWidth:'var(--max-width)', margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', gap:16 }}>
          {/* Logo */}
          <div onClick={() => navigate('home')} style={{ flexShrink:0, cursor:'pointer' }}>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:700, color:'var(--gold)', letterSpacing:3 }}>SGH</div>
            <div style={{ fontSize:7, color:'#555', letterSpacing:2, textTransform:'uppercase' }}>Style Gallery Hub</div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex:1, maxWidth:380, position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#555', fontSize:16, pointerEvents:'none' }}>⌕</span>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search products, brands..."
              style={{ width:'100%', padding:'9px 36px', background:'#1e1e1e', border:'1px solid #333', borderRadius:4, color:'white', fontSize:13, fontFamily:'var(--font-sans)' }}
            />
          </form>
<h1 className="text-4xl text-blue-500 text-center">
  Tailwind Working
</h1>
          {/* Desktop links */}
          <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:'auto' }}>
            {[['🏠','home'],['🛍 Shop','products'],['Women','products'],['Men','products'],['Accessories','products']].map(([l,p],i) => (
              <button key={i} onClick={() => navigate(p)} style={{ background:'none', border:'none', color:page===p?'var(--gold)':'#aaa', fontSize:11, letterSpacing:1, textTransform:'uppercase', padding:'6px 8px', cursor:'pointer', fontFamily:'var(--font-sans)', borderRadius:4 }}>
                {l}
              </button>
            ))}

            {/* Wishlist */}
            <button onClick={() => navigate('wishlist')} style={{ position:'relative', background:'none', border:'none', color:'#aaa', fontSize:18, cursor:'pointer', padding:'8px', borderRadius:4 }}>
              ♡{wishlist.length > 0 && <span style={{ position:'absolute', top:2, right:2, background:'var(--gold)', color:'var(--dark)', borderRadius:'50%', width:15, height:15, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{wishlist.length}</span>}
            </button>

            {/* Cart */}
            <button onClick={() => navigate('cart')} style={{ position:'relative', background:'none', border:'none', color:'#aaa', fontSize:18, cursor:'pointer', padding:'8px', borderRadius:4 }}>
              🛍{cartCount > 0 && <span style={{ position:'absolute', top:2, right:2, background:'var(--gold)', color:'var(--dark)', borderRadius:'50%', width:15, height:15, fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
            </button>

            {/* User */}
            {user ? (
              <div style={{ position:'relative' }}>
                <button onClick={() => setDropOpen(!dropOpen)} style={{ display:'flex', alignItems:'center', gap:6, background:'#1e1e1e', border:'1px solid #333', borderRadius:50, padding:'5px 12px 5px 6px', color:'white', cursor:'pointer' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--gold)', color:'var(--dark)', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{user.name?.[0]}</div>
                  <span style={{ fontSize:12, color:'#ccc' }}>{user.name?.split(' ')[0]}</span>
                  <span style={{ fontSize:9, color:'#555' }}>▾</span>
                </button>
                {dropOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, minWidth:200, background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', overflow:'hidden', zIndex:300 }}>
                    <div style={{ padding:'12px 16px', background:'var(--gold-pale)', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ fontWeight:600, fontSize:14 }}>{user.name}</div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>{user.email}</div>
                    </div>
                    {[['📦 Orders','orders'],['♡ Wishlist','wishlist']].map(([l,p]) => (
                      <button key={p} onClick={() => { navigate(p); setDropOpen(false); }}
                        style={{ display:'block', width:'100%', padding:'10px 16px', fontSize:13, color:'var(--mid)', background:'none', border:'none', textAlign:'left', cursor:'pointer', fontFamily:'var(--font-sans)', borderBottom:'1px solid var(--border)' }}>
                        {l}
                      </button>
                    ))}
                    {user.role === 'admin' && (
                      <button onClick={() => { navigate('admin'); setDropOpen(false); }}
                        style={{ display:'block', width:'100%', padding:'10px 16px', fontSize:13, color:'var(--gold)', fontWeight:700, background:'none', border:'none', textAlign:'left', cursor:'pointer', fontFamily:'var(--font-sans)', borderBottom:'1px solid var(--border)' }}>
                        ⚙ Admin Panel
                      </button>
                    )}
                    <button onClick={() => { handleLogout(); setDropOpen(false); }}
                      style={{ display:'block', width:'100%', padding:'10px 16px', fontSize:13, color:'var(--danger)', background:'none', border:'none', textAlign:'left', cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                      ↪ Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('login')} className="btn btn-primary btn-sm">Login</button>
            )}
          </div>
        </div>
      </nav>
    );
  };
   <div>

      {/* Cursor Glow */}
      <div id="cursorGlow"></div>

      {/* Navbar */}
      <nav id="navbar" className="navbar">
        <h2>Style Gallery Hub</h2>
        <input id="searchInput" type="text" placeholder="Search products..." />
      </nav>

      {/* Loading */}
      <div id="loadingWrap" style={{display: "none"}}>Loading...</div>

      {/* Error */}
      <div id="errorWrap" style={{display: "none"}}>
        <p id="errorMsg"></p>
        <button id="retryBtn">Retry</button>
      </div>

      {/* Product Grid */}
      <div id="productGrid" className="category-grid"></div>

      {/* Toast */}
      <div id="cartToast" className="toast">
        <span id="toastMsg"></span>
      </div>

    </div>

  const Footer = () => (
    <footer style={{ background:'var(--dark)', color:'#aaa', padding:'48px 24px 24px', marginTop:80 }}>
      <div style={{ maxWidth:'var(--max-width)', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:32, marginBottom:40 }}>
          <div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:24, fontWeight:700, color:'var(--gold)', letterSpacing:4, marginBottom:4 }}>SGH</div>
            <div style={{ fontSize:8, color:'#555', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Style Gallery Hub</div>
            <p style={{ fontSize:13, color:'#666', lineHeight:1.8 }}>Curated fashion for the discerning individual.</p>
          </div>
          {[['Shop',['All Products','Women','Men','Accessories','Sale']],['Account',['My Orders','Wishlist','Login']],['Help',['Shipping','Returns','Size Guide','FAQ']]].map(([h,links]) => (
            <div key={h}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'var(--gold)', marginBottom:14 }}>{h}</div>
              {links.map(l => (
                <div key={l} onClick={() => navigate('products')} style={{ fontSize:13, color:'#666', marginBottom:9, cursor:'pointer', transition:'color .2s' }}
                  onMouseOver={e => e.target.style.color='var(--gold)'} onMouseOut={e => e.target.style.color='#666'}>
                  {l}
                </div>
              ))}
            </div>
          ))}
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'var(--gold)', marginBottom:14 }}>Newsletter</div>
            <p style={{ fontSize:12, color:'#666', marginBottom:12, lineHeight:1.7 }}>Get style updates and exclusive offers.</p>
            <div style={{ display:'flex', border:'1px solid #333', borderRadius:4, overflow:'hidden' }}>
              <input placeholder="your@email.com" style={{ flex:1, padding:'8px 12px', background:'#1a1a1a', border:'none', color:'white', fontSize:12, fontFamily:'var(--font-sans)' }} />
              <button style={{ padding:'8px 14px', background:'var(--gold)', color:'var(--dark)', border:'none', cursor:'pointer', fontWeight:700 }}>→</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid #1e1e1e', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:12, color:'#555' }}>© 2024 Style Gallery Hub. Made with ♥ in India.</p>
          <div style={{ display:'flex', gap:8 }}>
            {['VISA','MC','UPI','GPay'].map(p => (
              <span key={p} style={{ padding:'2px 8px', border:'1px solid #2a2a2a', borderRadius:3, fontSize:10, fontWeight:700, color:'#555' }}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div>
      {page !== 'admin' && <Navbar />}

      {page === 'home'     && <HomePage onNavigate={navigate} onAdd={addToCart} wishlist={wishlist} onWish={toggleWishlist} />}
      {page === 'products' && <ProductsPage onAdd={addToCart} wishlist={wishlist} onWish={toggleWishlist} />}
      {page === 'product'  && <ProductDetailPage productId={pageData.id} onAdd={addToCart} onNavigate={navigate} wishlist={wishlist} onWish={toggleWishlist} />}
      {page === 'cart'     && <CartPage cart={cart} onUpdate={updateCart} onRemove={removeFromCart} onNavigate={navigate} user={user} />}
      {page === 'checkout' && <CheckoutPage cart={cart} onPlaceOrder={handlePlaceOrder} onNavigate={navigate} user={user} />}
      {page === 'orders'   && <OrdersPage orders={orders} user={user} onNavigate={navigate} />}
      {page === 'wishlist' && <WishlistPage wishlist={wishlist} onAdd={addToCart} onWish={toggleWishlist} onNavigate={navigate} />}
      {page === 'login'    && <LoginPage onLogin={handleLogin} onNavigate={navigate} />}
      {page === 'admin'    && <AdminPanel user={user} />}

      {page !== 'admin' && <Footer />}

      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--dark)', color:'white', padding:'12px 24px', borderRadius:'var(--radius)', fontSize:13, zIndex:999, boxShadow:'var(--shadow-lg)', animation:'fadeIn .3s ease', maxWidth:320 }}>
          {toast}
        </div>
      )}
    </div>
  );
}