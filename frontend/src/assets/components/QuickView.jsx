import { useState } from 'react';

const formatPrice = p => '₹' + p.toLocaleString('en-IN');

export default function QuickView({ product, onClose, onAdd, onWish, wished }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product) return null;

  const disc = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    onAdd && onAdd(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--white)', borderRadius:'var(--radius-xl)', maxWidth:800, width:'100%', overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', maxHeight:'90vh', animation:'scaleIn .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div style={{ background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:100, padding:40, position:'relative' }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
            : product.emoji || '👗'
          }
          {disc && <span className="badge badge-danger" style={{ position:'absolute', top:16, left:16, fontSize:11 }}>-{disc}%</span>}
        </div>

        {/* Info */}
        <div style={{ padding:32, overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:24, color:'var(--muted)', cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)', marginBottom:6 }}>{product.category}</div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400, marginBottom:10, lineHeight:1.2 }}>{product.name}</h2>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <span style={{ color:'var(--gold)', fontSize:14 }}>{'★'.repeat(Math.floor(product.rating || 4))}{'☆'.repeat(5-Math.floor(product.rating || 4))}</span>
            <span style={{ fontSize:12, color:'var(--muted)' }}>({product.numReviews || product.reviews?.length || 0} reviews)</span>
          </div>

          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:20 }}>
            <span style={{ fontSize:28, fontWeight:700, color:'var(--gold)', fontFamily:'var(--font-serif)' }}>{formatPrice(product.price)}</span>
            {product.originalPrice && <span style={{ fontSize:16, color:'var(--muted)', textDecoration:'line-through' }}>{formatPrice(product.originalPrice)}</span>}
          </div>

          <p style={{ fontSize:13, color:'var(--mid)', lineHeight:1.7, marginBottom:20 }}>
            {product.description || 'Premium quality craftsmanship. Designed for the discerning individual.'}
          </p>

          {/* Stock */}
          {product.stock <= 5 && product.stock > 0 && (
            <div style={{ fontSize:12, color:'#f59e0b', fontWeight:600, marginBottom:12 }}>⚠ Only {product.stock} left in stock!</div>
          )}

          {/* Qty + add */}
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:36, height:42, background:'var(--surface)', border:'none', fontSize:18, cursor:'pointer', color:'var(--mid)' }}>−</button>
              <span style={{ width:40, textAlign:'center', fontWeight:600 }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock||10,q+1))} style={{ width:36, height:42, background:'var(--surface)', border:'none', fontSize:18, cursor:'pointer', color:'var(--mid)' }}>+</button>
            </div>
            <button onClick={handleAdd} style={{ flex:1, padding:'0 20px', background:added?'var(--success)':'var(--dark)', color:'white', border:'none', borderRadius:'var(--radius-sm)', fontSize:12, letterSpacing:'1.5px', textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-sans)', fontWeight:600, transition:'background .3s' }}>
              {added ? '✓ Added!' : 'Add to Cart'}
            </button>
            <button onClick={() => onWish && onWish(product)} style={{ width:42, borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:wished?'var(--gold-light)':'var(--white)', fontSize:20, cursor:'pointer', color:wished?'#e53e3e':'#bbb', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {wished?'♥':'♡'}
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {['🚚 Free delivery above ₹2,000','↩ 30-day returns','🔒 Secure checkout','🎁 Gift wrapping'].map(f => (
              <div key={f} style={{ padding:'7px 10px', background:'var(--surface)', borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--mid)' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}