import { useState } from 'react';

const formatPrice = p => '₹' + p.toLocaleString('en-IN');

const SAMPLE = [
  { id:1, name:'Cashmere Turtleneck',  price:4999,  originalPrice:6499,  category:'Women',      rating:4.8, numReviews:124, stock:12, emoji:'🧥', material:'100% Cashmere',  fit:'Relaxed',       care:'Dry Clean', origin:'Scotland',  brand:'SGH Studio',    tag:'Bestseller' },
  { id:4, name:'Italian Wool Blazer',  price:11999, originalPrice:null,  category:'Men',        rating:4.6, numReviews:56,  stock:6,  emoji:'🧣', material:'100% Wool',      fit:'Slim',          care:'Dry Clean', origin:'Italy',     brand:'Atelier SGH',   tag:null },
  { id:6, name:'Fine Merino Crewneck', price:3799,  originalPrice:4999,  category:'Women',      rating:4.4, numReviews:89,  stock:18, emoji:'🧶', material:'Merino Wool',    fit:'Regular',       care:'Hand Wash', origin:'New Zealand',brand:'SGH Basics',    tag:'Sale' },
];

const ATTRS = [
  { key:'price',         label:'Price',         render: p => <span style={{fontWeight:700,color:'var(--gold)',fontSize:18}}>{formatPrice(p.price)}</span> },
  { key:'originalPrice', label:'Original Price', render: p => p.originalPrice ? <span style={{textDecoration:'line-through',color:'var(--muted)'}}>{formatPrice(p.originalPrice)}</span> : <span style={{color:'var(--muted)'}}>—</span> },
  { key:'rating',        label:'Rating',        render: p => <span>{'★'.repeat(Math.floor(p.rating))}<span style={{color:'var(--muted)'}}>{'☆'.repeat(5-Math.floor(p.rating))}</span> {p.rating} ({p.numReviews})</span> },
  { key:'category',      label:'Category',      render: p => <span className="badge badge-gold">{p.category}</span> },
  { key:'material',      label:'Material',      render: p => p.material },
  { key:'fit',           label:'Fit',           render: p => p.fit },
  { key:'care',          label:'Care',          render: p => p.care },
  { key:'origin',        label:'Made In',       render: p => p.origin },
  { key:'brand',         label:'Brand',         render: p => <strong>{p.brand}</strong> },
  { key:'stock',         label:'Availability',  render: p => p.stock > 10
      ? <span style={{color:'var(--success)',fontWeight:600}}>✓ In Stock ({p.stock})</span>
      : p.stock > 0
        ? <span style={{color:'#f59e0b',fontWeight:600}}>⚠ Low Stock ({p.stock})</span>
        : <span style={{color:'var(--danger)',fontWeight:600}}>✕ Out of Stock</span>
  },
  { key:'tag',           label:'Tag',           render: p => p.tag ? <span className={`badge badge-${p.tag==='Sale'?'danger':p.tag==='New'?'info':'gold'}`}>{p.tag}</span> : <span style={{color:'var(--muted)'}}>—</span> },
];

export default function ComparePage({ onAdd, onNavigate }) {
  const [selected, setSelected] = useState(SAMPLE.slice(0, 3));
  const [adding, setAdding] = useState(false);

  const remove = (id) => setSelected(s => s.filter(p => p.id !== id));

  // Highlight the best value in each row
  const isBest = (attr, product) => {
    if (attr.key === 'price') return product.price === Math.min(...selected.map(p => p.price));
    if (attr.key === 'rating') return product.rating === Math.max(...selected.map(p => p.rating));
    if (attr.key === 'stock') return product.stock === Math.max(...selected.map(p => p.stock));
    return false;
  };

  return (
    <div style={{ maxWidth:'var(--max-width)', margin:'0 auto', padding:'40px 24px' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:36, fontWeight:400, marginBottom:6 }}>Compare Products</h1>
        <p style={{ color:'var(--muted)', fontSize:14 }}>Compare up to 3 products side-by-side to find your perfect match.</p>
      </div>

      {selected.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 24px' }}>
          <div style={{ fontSize:72, marginBottom:16 }}>⚖️</div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:8 }}>Nothing to Compare</h2>
          <p style={{ color:'var(--muted)', marginBottom:24 }}>Browse products and click "Compare" to add them here.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('products')}>Browse Products</button>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
            {/* Product headers */}
            <thead>
              <tr>
                <th style={{ width:160, padding:'12px 16px', background:'var(--surface)', borderBottom:'2px solid var(--border)', textAlign:'left', fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'var(--muted)' }}>Feature</th>
                {selected.map(p => (
                  <th key={p.id} style={{ padding:'12px 16px', background:'var(--white)', borderBottom:'2px solid var(--gold)', borderLeft:'1px solid var(--border)', textAlign:'center', position:'relative' }}>
                    <div style={{ position:'relative' }}>
                      <button onClick={() => remove(p.id)} style={{ position:'absolute', top:-4, right:-4, width:22, height:22, borderRadius:'50%', background:'var(--surface)', border:'1px solid var(--border)', fontSize:14, lineHeight:1, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)' }}>×</button>
                      <div style={{ fontSize:48, marginBottom:8 }}>{p.emoji}</div>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{p.name}</div>
                    </div>
                  </th>
                ))}
                {selected.length < 3 && (
                  <th style={{ padding:'12px 16px', background:'var(--surface)', borderLeft:'1px solid var(--border)', textAlign:'center', borderBottom:'2px solid var(--border)' }}>
                    <button onClick={() => onNavigate('products')}
                      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, background:'none', border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:'24px 20px', cursor:'pointer', width:'100%', color:'var(--muted)', transition:'all .2s' }}
                      onMouseOver={e => e.currentTarget.style.borderColor='var(--gold)'}
                      onMouseOut={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <span style={{ fontSize:28 }}>+</span>
                      <span style={{ fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>Add Product</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>

            {/* Attribute rows */}
            <tbody>
              {ATTRS.map((attr, ri) => (
                <tr key={attr.key} style={{ background: ri % 2 === 0 ? 'var(--white)' : 'var(--surface)' }}>
                  <td style={{ padding:'14px 16px', fontSize:12, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', color:'var(--muted)', whiteSpace:'nowrap' }}>{attr.label}</td>
                  {selected.map(p => {
                    const best = isBest(attr, p);
                    return (
                      <td key={p.id} style={{ padding:'14px 16px', borderLeft:'1px solid var(--border)', textAlign:'center', fontSize:13, background: best ? 'rgba(184,134,11,.06)' : 'transparent', position:'relative' }}>
                        {best && <span style={{ position:'absolute', top:6, right:6, fontSize:10, color:'var(--gold)' }}>★</span>}
                        {attr.render(p)}
                      </td>
                    );
                  })}
                  {selected.length < 3 && <td style={{ borderLeft:'1px solid var(--border)' }} />}
                </tr>
              ))}

              {/* Actions row */}
              <tr>
                <td style={{ padding:'16px', background:'var(--gold-pale)' }} />
                {selected.map(p => (
                  <td key={p.id} style={{ padding:'16px', borderLeft:'1px solid var(--border)', textAlign:'center', background:'var(--gold-pale)' }}>
                    <button className="btn btn-primary btn-sm" style={{ width:'100%', marginBottom:8 }} onClick={() => onAdd && onAdd(p)}>Add to Cart</button>
                    <button className="btn btn-outline btn-sm" style={{ width:'100%' }} onClick={() => onNavigate('products')}>View Details</button>
                  </td>
                ))}
                {selected.length < 3 && <td style={{ borderLeft:'1px solid var(--border)', background:'var(--gold-pale)' }} />}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop:32, padding:'16px 20px', background:'var(--surface)', borderRadius:'var(--radius)', fontSize:12, color:'var(--muted)' }}>
        ★ = Best value in this category across compared products.
      </div>
    </div>
  );
}