import { useState, useEffect } from 'react';

// ─── Promotional Top Banner ──────────────────────────────────
export function PromoBanner({ message = '🎉 FREE SHIPPING on orders above ₹2,000 · Use code WELCOME10 for 10% off your first order!', onClose }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ background:'var(--dark)', color:'var(--gold)', padding:'9px 16px', textAlign:'center', fontSize:12, fontWeight:600, letterSpacing:.5, display:'flex', alignItems:'center', justifyContent:'center', gap:16, position:'relative' }}>
      <span>{message}</span>
      <button onClick={() => { setVisible(false); onClose && onClose(); }}
        style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:18, lineHeight:1, padding:0 }}>
        ×
      </button>
    </div>
  );
}

// ─── Newsletter Popup ─────────────────────────────────────────
export function NewsletterPopup({ delay = 8000 }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  useEffect(() => {
    // Don't show if already subscribed or dismissed
    if (localStorage.getItem('sgh_newsletter_dismissed')) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('sgh_newsletter_dismissed', '1');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setDone(true);
    setTimeout(() => { dismiss(); }, 2500);
  };

  if (!show) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn .3s ease' }}>
      <div style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', maxWidth:480, width:'100%', overflow:'hidden', boxShadow:'var(--shadow-lg)', animation:'scaleIn .3s ease' }}>
        {/* Banner image area */}
        <div style={{ background:'linear-gradient(135deg,#0f0f0f,#2d1f0e)', padding:'40px 40px 32px', textAlign:'center', position:'relative' }}>
          <button onClick={dismiss} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:22, lineHeight:1 }}>×</button>
          <div style={{ fontSize:48, marginBottom:12 }}>🎁</div>
          <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>Exclusive Offer</div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, color:'white', letterSpacing:1, marginBottom:8 }}>Get 10% Off Your First Order</h2>
          <p style={{ color:'#aaa', fontSize:13, lineHeight:1.6 }}>Join our style community and receive curated fashion inspiration, exclusive deals, and early access to new collections.</p>
        </div>

        {/* Form */}
        <div style={{ padding:'32px 40px' }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✓</div>
              <h3 style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:400, marginBottom:6 }}>You're In!</h3>
              <p style={{ color:'var(--muted)', fontSize:13 }}>Check your inbox for your 10% discount code.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ marginBottom:14 }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" style={{ marginBottom:16 }}>
                Claim My 10% Discount
              </button>
              <p style={{ fontSize:11, color:'var(--muted)', textAlign:'center' }}>
                No spam, ever. Unsubscribe anytime. By subscribing you agree to our Privacy Policy.
              </p>
              <button type="button" onClick={dismiss} style={{ display:'block', margin:'10px auto 0', background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)', textDecoration:'underline' }}>
                No thanks, I'll pay full price
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Flash Sale Countdown Timer ───────────────────────────────
export function FlashSaleTimer({ endsAt, title = 'Flash Sale Ends In' }) {
  const [timeLeft, setTimeLeft] = useState({ h:0, m:0, s:0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endsAt - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:'var(--dark)', color:'white', borderRadius:'var(--radius-lg)', padding:'12px 20px' }}>
      <span style={{ fontSize:16 }}>⏰</span>
      <span style={{ fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'var(--gold)' }}>{title}</span>
      <div style={{ display:'flex', gap:6 }}>
        {[['h',timeLeft.h],['m',timeLeft.m],['s',timeLeft.s]].map(([u,v]) => (
          <div key={u} style={{ textAlign:'center' }}>
            <div style={{ background:'#1a1a1a', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:20, fontWeight:700, fontFamily:'var(--font-serif)', minWidth:44 }}>{pad(v)}</div>
            <div style={{ fontSize:9, color:'#666', marginTop:3, letterSpacing:1.5, textTransform:'uppercase' }}>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cookie Consent Banner ────────────────────────────────────
export function CookieConsent() {
  const [show, setShow] = useState(() => !localStorage.getItem('sgh_cookies'));

  const accept = () => { localStorage.setItem('sgh_cookies', '1'); setShow(false); };
  const decline= () => { localStorage.setItem('sgh_cookies', '0'); setShow(false); };

  if (!show) return null;

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--dark)', color:'#ccc', padding:'16px 24px', zIndex:800, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, borderTop:'1px solid #2a2a2a' }}>
      <p style={{ fontSize:13, lineHeight:1.6, maxWidth:700, margin:0 }}>
        We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
        <a href="#" style={{ color:'var(--gold)', marginLeft:6, fontSize:12 }}>Learn more</a>
      </p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={decline} style={{ padding:'8px 18px', background:'transparent', border:'1px solid #444', borderRadius:'var(--radius-sm)', color:'#888', cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', letterSpacing:.5 }}>Decline</button>
        <button onClick={accept}  style={{ padding:'8px 18px', background:'var(--gold)', border:'none', borderRadius:'var(--radius-sm)', color:'var(--dark)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', fontWeight:700, letterSpacing:.5 }}>Accept All</button>
      </div>
    </div>
  );
}