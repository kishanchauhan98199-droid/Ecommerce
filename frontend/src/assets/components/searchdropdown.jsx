import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../../hooks';

const SAMPLE_PRODUCTS = [
  { id:1,  name:'Cashmere Turtleneck',    category:'Women',       price:4999  },
  { id:2,  name:'Leather Oxford Shoes',   category:'Men',         price:8499  },
  { id:3,  name:'Silk Wrap Dress',        category:'Women',       price:6299  },
  { id:4,  name:'Italian Wool Blazer',    category:'Men',         price:11999 },
  { id:5,  name:'Structured Handbag',     category:'Accessories', price:15999 },
  { id:6,  name:'Fine Merino Crewneck',   category:'Women',       price:3799  },
  { id:7,  name:'Slim Chinos',            category:'Men',         price:3499  },
  { id:8,  name:'Acetate Sunglasses',     category:'Accessories', price:5499  },
  { id:9,  name:'Gabardine Trench Coat',  category:'Women',       price:18999 },
  { id:10, name:'Premium Leather Sneakers',category:'Men',        price:7999  },
];

const RECENT_KEY = 'sgh_recent_searches';

export default function SearchDropdown({ value, onChange, onSelect, onSubmit }) {
  const [open,    setOpen]    = useState(false);
  const [recent,  setRecent]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
  });
  const containerRef = useRef(null);
  const debounced    = useDebounce(value, 200);

  const suggestions = debounced.trim().length > 0
    ? SAMPLE_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(debounced.toLowerCase()) ||
        p.category.toLowerCase().includes(debounced.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!containerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveRecent = (term) => {
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    saveRecent(value.trim());
    onSubmit && onSubmit(value.trim());
    setOpen(false);
  };

  const handleSelect = (item) => {
    saveRecent(item.name);
    onSelect && onSelect(item);
    setOpen(false);
  };

  const handleRecent = (term) => {
    onChange(term);
    onSubmit && onSubmit(term);
    setOpen(false);
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const formatPrice = p => '₹' + p.toLocaleString('en-IN');
  const showDropdown = open && (suggestions.length > 0 || recent.length > 0 || value.trim().length === 0);

  return (
    <div ref={containerRef} style={{ position:'relative', width:'100%' }}>
      {/* Input */}
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:18, pointerEvents:'none' }}>⌕</span>
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setOpen(false); }}
          placeholder="Search for products, brands, categories..."
          className="form-control"
          style={{ paddingLeft:46, paddingRight: value ? 44 : 16 }}
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(true); }}
            style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:20, lineHeight:1, padding:0 }}>
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
          background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)',
          boxShadow:'var(--shadow-lg)', zIndex:300, overflow:'hidden', maxHeight:400, overflowY:'auto',
          animation:'fadeIn .15s ease',
        }}>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div style={{ padding:'10px 16px 6px', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)' }}>Products</div>
              {suggestions.map(item => (
                <div key={item.id} onClick={() => handleSelect(item)}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', cursor:'pointer', transition:'background .15s' }}
                  onMouseOver={e => e.currentTarget.style.background='var(--gold-pale)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:16, color:'var(--muted)' }}>⌕</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>
                        {item.name.split(new RegExp(`(${value})`, 'gi')).map((part, i) =>
                          part.toLowerCase() === value.toLowerCase()
                            ? <mark key={i} style={{ background:'var(--gold-light)', borderRadius:2, fontWeight:700, color:'var(--dark)' }}>{part}</mark>
                            : part
                        )}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>{item.category}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'var(--gold)', flexShrink:0 }}>{formatPrice(item.price)}</span>
                </div>
              ))}
              <div onClick={handleSubmit}
                style={{ padding:'10px 16px', cursor:'pointer', fontSize:13, color:'var(--gold)', fontWeight:600, borderTop:'1px solid var(--border)', background:'var(--gold-pale)', display:'flex', alignItems:'center', gap:8 }}
                onMouseOver={e => e.currentTarget.style.background='var(--gold-light)'}
                onMouseOut={e => e.currentTarget.style.background='var(--gold-pale)'}>
                <span>⌕</span> See all results for "<strong>{value}</strong>"
              </div>
            </div>
          )}

          {/* Recent searches */}
          {suggestions.length === 0 && recent.length > 0 && (
            <div>
              <div style={{ padding:'10px 16px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)' }}>Recent</span>
                <button onClick={clearRecent} style={{ fontSize:11, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-sans)', textDecoration:'underline' }}>Clear</button>
              </div>
              {recent.map((term, i) => (
                <div key={i} onClick={() => handleRecent(term)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', transition:'background .15s' }}
                  onMouseOver={e => e.currentTarget.style.background='var(--surface)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <span style={{ fontSize:14, color:'var(--muted)' }}>🕐</span>
                  <span style={{ fontSize:13, color:'var(--mid)' }}>{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Empty state — no query, no recent */}
          {suggestions.length === 0 && recent.length === 0 && value.trim().length === 0 && (
            <div>
              <div style={{ padding:'10px 16px 6px', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--muted)' }}>Popular</div>
              {['Cashmere Sweaters','Leather Bags','Trench Coats','Men\'s Blazers'].map(term => (
                <div key={term} onClick={() => handleRecent(term)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', transition:'background .15s' }}
                  onMouseOver={e => e.currentTarget.style.background='var(--surface)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <span style={{ fontSize:14 }}>🔥</span>
                  <span style={{ fontSize:13, color:'var(--mid)' }}>{term}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}