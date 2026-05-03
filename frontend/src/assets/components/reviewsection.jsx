import { useState } from 'react';

const Stars = ({ rating, size = 14 }) => (
  <span style={{ color:'var(--gold)', fontSize:size, letterSpacing:1 }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5-Math.floor(rating))}
  </span>
);

function ReviewBar({ label, value, max = 100 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, fontSize:12 }}>
      <span style={{ color:'var(--muted)', width:16 }}>{label}</span>
      <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'var(--gold)', borderRadius:3, width:`${value}%`, transition:'width .6s ease' }} />
      </div>
      <span style={{ color:'var(--muted)', width:24, textAlign:'right' }}>{Math.round(value)}%</span>
    </div>
  );
}

const MOCK_REVIEWS = [
  { id:1, name:'Priya M.',   avatar:'P', rating:5, date:'2024-01-20', title:'Absolutely perfect!',      body:'Worth every rupee — the quality is exceptional and the fabric feels luxurious. I ordered my usual size and it fit perfectly. Will definitely buy more from this brand.',       helpful:24, verified:true  },
  { id:2, name:'Rahul K.',   avatar:'R', rating:4, date:'2024-01-15', title:'Great quality',             body:'Really impressed with the craftsmanship. Delivered quickly and well packaged. Only minor issue is it runs slightly large, so consider sizing down.',                         helpful:18, verified:true  },
  { id:3, name:'Anjali S.',  avatar:'A', rating:5, date:'2024-02-01', title:'Love it!',                  body:'I received so many compliments wearing this. The color is exactly as shown in the photos. Excellent value for money.',                                                       helpful:31, verified:true  },
  { id:4, name:'Vikram P.',  avatar:'V', rating:3, date:'2024-02-08', title:'Good but delivery was slow', body:'Product itself is nice but the delivery took 8 days. Customer service was helpful when I inquired. The item matches the description accurately.',                          helpful:7,  verified:false },
  { id:5, name:'Meera R.',   avatar:'M', rating:5, date:'2024-02-14', title:'Gift-worthy quality',       body:'Bought this as a birthday gift and my friend loved it. The packaging was beautiful — feels premium from the moment you open the box.',                                      helpful:19, verified:true  },
];

export default function ReviewSection({ productId, productRating = 4.7, totalReviews = 203, user, onNavigate }) {
  const [reviews, setReviews]   = useState(MOCK_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [rating,   setRating]   = useState(0);
  const [hover,    setHover]    = useState(0);
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [filter,   setFilter]   = useState('all');
  const [sort,     setSort]     = useState('recent');
  const [helpful,  setHelpful]  = useState({});
  const [submitted,setSubmitted]= useState(false);

  const DIST = { 5:72, 4:18, 3:6, 2:2, 1:2 };

  const filtered = [...reviews]
    .filter(r => filter === 'all' ? true : r.rating === Number(filter))
    .sort((a,b) => sort === 'helpful' ? b.helpful - a.helpful : new Date(b.date) - new Date(a.date));

  const submitReview = () => {
    if (!rating || !body.trim()) return;
    const newReview = { id:Date.now(), name:user?.name||'Anonymous', avatar:(user?.name||'A')[0].toUpperCase(), rating, date:new Date().toISOString().split('T')[0], title, body, helpful:0, verified:true };
    setReviews(r => [newReview, ...r]);
    setRating(0); setTitle(''); setBody('');
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markHelpful = (id) => {
    if (helpful[id]) return;
    setHelpful(h => ({ ...h, [id]: true }));
    setReviews(r => r.map(x => x.id === id ? { ...x, helpful: x.helpful + 1 } : x));
  };

  return (
    <section style={{ marginTop:64, paddingTop:48, borderTop:'1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:36, flexWrap:'wrap', gap:16 }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:4 }}>Customer Reviews</h2>
          <p style={{ color:'var(--muted)', fontSize:13 }}>{totalReviews} verified purchases</p>
        </div>
        {!showForm && (
          <button className="btn btn-outline" onClick={() => user ? setShowForm(true) : onNavigate('login')}>
            {user ? 'Write a Review' : 'Login to Review'}
          </button>
        )}
      </div>

      {submitted && (
        <div style={{ background:'var(--success-bg)', border:'1px solid var(--success)', borderRadius:'var(--radius)', padding:'12px 18px', marginBottom:20, fontSize:13, color:'var(--success)' }}>
          ✓ Thank you! Your review has been submitted.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:40, alignItems:'start' }}>
        {/* Rating summary */}
        <div>
          <div style={{ background:'var(--gold-pale)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24, marginBottom:16 }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:56, fontWeight:300, fontFamily:'var(--font-serif)', color:'var(--dark)', lineHeight:1 }}>{productRating}</div>
              <Stars rating={productRating} size={22} />
              <div style={{ fontSize:12, color:'var(--muted)', marginTop:6 }}>out of 5 · {totalReviews} reviews</div>
            </div>
            {[5,4,3,2,1].map(n => (
              <button key={n} onClick={() => setFilter(filter===String(n)?'all':String(n))}
                style={{ display:'block', width:'100%', background:filter===String(n)?'var(--gold-light)':'transparent', border:'none', cursor:'pointer', borderRadius:'var(--radius-sm)', padding:'3px 4px', transition:'background .2s' }}>
                <ReviewBar label={n} value={DIST[n]} />
              </button>
            ))}
          </div>

          {/* Write review form */}
          {showForm && (
            <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:24 }}>
              <h3 style={{ fontFamily:'var(--font-serif)', fontSize:18, fontWeight:400, marginBottom:16 }}>Your Review</h3>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--mid)', marginBottom:8 }}>Rating *</div>
                <div style={{ display:'flex', gap:4 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
                      style={{ background:'none', border:'none', fontSize:28, cursor:'pointer', color:(hover||rating)>=s?'var(--gold)':'var(--border)', lineHeight:1, transition:'color .15s' }}>★</button>
                  ))}
                </div>
                {rating > 0 && <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{['','Terrible','Poor','Average','Good','Excellent'][rating]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Review Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Summarise your experience" className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Your Review *</label>
                <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tell others what you thought about this product..." className="form-control" rows={4} />
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, textAlign:'right' }}>{body.length}/500</div>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={submitReview} disabled={!rating||!body.trim()}>Submit Review</button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Review list */}
        <div>
          {/* Controls */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:8 }}>
              {[['all','All'],['5','5★'],['4','4★'],['3','3★']].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  style={{ padding:'6px 14px', borderRadius:50, fontSize:12, border:'1px solid var(--border)', background:filter===v?'var(--dark)':'var(--white)', color:filter===v?'white':'var(--mid)', cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all .15s' }}>
                  {l}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="form-control" style={{ width:'auto', fontSize:12 }}>
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Individual reviews */}
          {filtered.length === 0
            ? <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>No reviews for this rating yet.</div>
            : filtered.map(rev => (
              <div key={rev.id} style={{ padding:'24px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--gold-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--warning)', flexShrink:0 }}>{rev.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{rev.name}</span>
                      {rev.verified && <span className="badge badge-success" style={{ fontSize:10 }}>Verified Purchase</span>}
                      <span style={{ fontSize:11, color:'var(--muted)', marginLeft:'auto' }}>{rev.date}</span>
                    </div>
                    <Stars rating={rev.rating} />
                    {rev.title && <div style={{ fontWeight:600, fontSize:14, marginTop:6, marginBottom:4 }}>{rev.title}</div>}
                    <p style={{ fontSize:13, color:'var(--mid)', lineHeight:1.7, margin:0 }}>{rev.body}</p>
                  </div>
                </div>
                <button onClick={() => markHelpful(rev.id)}
                  style={{ marginLeft:54, background:'none', border:'1px solid var(--border)', borderRadius:50, padding:'4px 12px', fontSize:11, color:helpful[rev.id]?'var(--success)':'var(--muted)', cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all .15s' }}>
                  {helpful[rev.id] ? '✓ Helpful' : '👍 Helpful'} ({rev.helpful + (helpful[rev.id]?1:0)})
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  );
}