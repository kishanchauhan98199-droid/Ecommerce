import { useState } from 'react';

export default function CouponInput({ cartTotal, onApply, onRemove, applied }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Mock coupons for demo (replace with API call in production)
  const MOCK_COUPONS = {
    'WELCOME10': { type:'percent', value:10, description:'10% off for new customers',       minOrder:0     },
    'FLAT500':   { type:'fixed',   value:500, description:'₹500 off on orders above ₹2,000', minOrder:2000  },
    'STYLE20':   { type:'percent', value:20, description:'20% off, max ₹2,000',             minOrder:5000  },
    'SGH2024':   { type:'fixed',   value:200, description:'₹200 off — Special offer',        minOrder:1000  },
  };

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 600));

    const coupon = MOCK_COUPONS[trimmed];
    if (!coupon) {
      setError('Invalid or expired coupon code');
      setLoading(false);
      return;
    }
    if (cartTotal < coupon.minOrder) {
      setError(`Minimum cart value of ₹${coupon.minOrder.toLocaleString('en-IN')} required`);
      setLoading(false);
      return;
    }

    let discount;
    if (coupon.type === 'percent') {
      discount = Math.round((cartTotal * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, cartTotal);
    }

    onApply({ code: trimmed, discount, description: coupon.description, type: coupon.type, value: coupon.value });
    setLoading(false);
    setCode('');
  };

  const formatPrice = p => '₹' + p.toLocaleString('en-IN');

  if (applied) {
    return (
      <div style={{ padding:'12px 16px', background:'var(--success-bg)', border:'1px solid #a3d9a3', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <span style={{ fontSize:14, color:'var(--success)' }}>✓</span>
            <span style={{ fontWeight:700, fontSize:13, color:'var(--success)', letterSpacing:.5 }}>{applied.code}</span>
            <span className="badge badge-success" style={{ fontSize:9 }}>Applied</span>
          </div>
          <div style={{ fontSize:12, color:'var(--success)' }}>
            {applied.description} — saving <strong>{formatPrice(applied.discount)}</strong>
          </div>
        </div>
        <button onClick={onRemove}
          style={{ background:'none', border:'none', color:'var(--success)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4, opacity:.7 }}>
          ×
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', gap:8 }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="Enter coupon code"
          className="form-control"
          style={{ flex:1, letterSpacing:1, fontWeight:600, fontSize:13 }}
          maxLength={20}
        />
        <button
          onClick={apply}
          disabled={loading || !code.trim()}
          className="btn btn-outline btn-sm"
          style={{ whiteSpace:'nowrap', minWidth:80 }}
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>

      {error && <p style={{ fontSize:12, color:'var(--danger)', marginTop:6 }}>{error}</p>}

      <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:'var(--muted)' }}>Try:</span>
        {['WELCOME10','FLAT500','STYLE20'].map(c => (
          <button key={c} onClick={() => { setCode(c); setError(''); }}
            style={{ fontSize:10, padding:'2px 8px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:50, cursor:'pointer', fontFamily:'var(--font-sans)', color:'var(--mid)', letterSpacing:.5, fontWeight:600 }}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}