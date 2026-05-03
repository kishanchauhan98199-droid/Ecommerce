import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sgh_recently_viewed';
const MAX_ITEMS   = 8;

// Hook — call this in ProductDetail to track views
export function useRecentlyViewed(product) {
  useEffect(() => {
    if (!product) return;
    const id = product._id || product.id;
    const current = getRecentlyViewed();
    const updated = [{ id, name:product.name, price:product.price, image:product.image, emoji:product.emoji, category:product.category }, ...current.filter(p => p.id !== id)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [product]);
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(STORAGE_KEY);
}

const formatPrice = p => '₹' + p.toLocaleString('en-IN');

export default function RecentlyViewed({ currentId, onAdd, onNavigate }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    setItems(all.filter(p => p.id !== currentId));
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop:64, paddingTop:48, borderTop:'1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <span style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'var(--gold)', marginBottom:6 }}>Your History</span>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400 }}>Recently Viewed</h2>
        </div>
        <button onClick={clearRecentlyViewed} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-sans)', letterSpacing:.5, textDecoration:'underline' }}>Clear</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 }}>
        {items.slice(0, 6).map(item => (
          <div key={item.id} onClick={() => onNavigate && onNavigate('product', { id: item.id })}
            style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', cursor:'pointer', transition:'transform .2s,box-shadow .2s' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow)'; }}
            onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{ aspectRatio:'1/1', background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>
              {item.image ? <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : item.emoji || '👗'}
            </div>
            <div style={{ padding:12 }}>
              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:1 }}>{item.category}</div>
              <div style={{ fontSize:12, fontWeight:500, marginBottom:6, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--gold)', marginBottom:8 }}>{formatPrice(item.price)}</div>
              <button onClick={e => { e.stopPropagation(); onAdd && onAdd(item); }}
                style={{ width:'100%', padding:'6px', background:'var(--dark)', color:'white', border:'none', borderRadius:'var(--radius-sm)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', cursor:'pointer', fontFamily:'var(--font-sans)', transition:'background .2s' }}
                onMouseOver={e => e.target.style.background='var(--gold)'}
                onMouseOut={e => e.target.style.background='var(--dark)'}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}