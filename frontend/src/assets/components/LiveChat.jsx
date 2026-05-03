import { useState, useRef, useEffect } from 'react';

const BOT_NAME   = 'SGH Assistant';
const BOT_AVATAR = '🛍️';

const AUTO_REPLIES = {
  default:   ["I'll help you with that! Could you tell me more?", "Great question! Let me look into that for you.", "I'm here to help. What would you like to know?"],
  shipping:  ["We offer free shipping on all orders above ₹2,000! Standard delivery takes 3–5 business days. Express delivery (1–2 days) is available for ₹299."],
  return:    ["Our return policy allows returns within 30 days of delivery. Items must be unused with original tags. We offer free return pickup for most pin codes."],
  size:      ["Our size guide is available on each product page. For best fit, we recommend measuring your chest, waist, and hips. Need help with a specific item?"],
  payment:   ["We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery. All transactions are SSL encrypted."],
  order:     ["You can track your order from the 'My Orders' section after logging in. You'll also receive email updates at each stage of delivery."],
  discount:  ["Check out our current sale section for up to 30% off! You can also use coupon code WELCOME10 for 10% off your first order."],
  hello:     ["Hello! 👋 Welcome to Style Gallery Hub. How can I help you today?", "Hi there! I'm here to help you find the perfect style. What are you looking for?"],
};

const getReply = (message) => {
  const msg = message.toLowerCase();
  if (msg.match(/hello|hi|hey|namaste/))            return AUTO_REPLIES.hello[Math.floor(Math.random() * AUTO_REPLIES.hello.length)];
  if (msg.match(/ship|deliver|dispatch|track/))      return AUTO_REPLIES.shipping[0];
  if (msg.match(/return|refund|exchange/))           return AUTO_REPLIES.return[0];
  if (msg.match(/size|fit|measure/))                 return AUTO_REPLIES.size[0];
  if (msg.match(/pay|card|upi|cod|cash/))            return AUTO_REPLIES.payment[0];
  if (msg.match(/order|track|status/))               return AUTO_REPLIES.order[0];
  if (msg.match(/discount|coupon|offer|sale/))       return AUTO_REPLIES.discount[0];
  return AUTO_REPLIES.default[Math.floor(Math.random() * AUTO_REPLIES.default.length)];
};

const QUICK_REPLIES = ['Shipping info', 'Return policy', 'Size guide', 'Payment options', 'Track my order'];

export default function LiveChat({ user }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { id:1, from:'bot', text:`Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm the SGH Assistant. How can I help you today?`, time: new Date() }
  ]);
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [unread,   setUnread]   = useState(0);
  const endRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), from:'user', text: msg, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    setTyping(false);

    const reply = getReply(msg);
    const botMsg = { id: Date.now() + 1, from:'bot', text: reply, time: new Date() };
    setMessages(m => [...m, botMsg]);

    if (!open) setUnread(u => u + 1);
  };

  const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:84, right:24, width:340, height:480,
          background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)',
          boxShadow:'var(--shadow-lg)', zIndex:400, display:'flex', flexDirection:'column',
          overflow:'hidden', animation:'scaleIn .2s ease',
        }}>
          {/* Header */}
          <div style={{ background:'var(--dark)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{BOT_AVATAR}</div>
            <div style={{ flex:1 }}>
              <div style={{ color:'white', fontWeight:700, fontSize:14 }}>{BOT_NAME}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80' }} />
                <span style={{ color:'#aaa', fontSize:11 }}>Online · Usually replies instantly</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:20, lineHeight:1, padding:4 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', flexDirection:msg.from==='user'?'row-reverse':'row', alignItems:'flex-end', gap:8 }}>
                {msg.from === 'bot' && (
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{BOT_AVATAR}</div>
                )}
                <div>
                  <div style={{
                    maxWidth:220, padding:'10px 14px', borderRadius:msg.from==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
                    background:msg.from==='user'?'var(--dark)':'var(--surface)',
                    color:msg.from==='user'?'white':'var(--dark)',
                    fontSize:13, lineHeight:1.5,
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:3, textAlign:msg.from==='user'?'right':'left' }}>{fmtTime(msg.time)}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{BOT_AVATAR}</div>
                <div style={{ padding:'12px 16px', background:'var(--surface)', borderRadius:'18px 18px 18px 4px' }}>
                  <div style={{ display:'flex', gap:4, alignItems:'center', height:16 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--muted)', animation:`bounce .8s ${i*0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies */}
            {messages.length <= 2 && !typing && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
                {QUICK_REPLIES.map(qr => (
                  <button key={qr} onClick={() => sendMessage(qr)}
                    style={{ padding:'5px 12px', borderRadius:50, fontSize:11, border:'1px solid var(--border)', background:'var(--white)', color:'var(--mid)', cursor:'pointer', fontFamily:'var(--font-sans)', transition:'all .15s' }}
                    onMouseOver={e => { e.target.style.background='var(--dark)'; e.target.style.color='white'; e.target.style.borderColor='var(--dark)'; }}
                    onMouseOut={e => { e.target.style.background='var(--white)'; e.target.style.color='var(--mid)'; e.target.style.borderColor='var(--border)'; }}>
                    {qr}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:8, flexShrink:0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{ flex:1, padding:'9px 14px', border:'1px solid var(--border)', borderRadius:50, fontSize:13, fontFamily:'var(--font-sans)', outline:'none' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              style={{ width:38, height:38, borderRadius:'50%', background:input.trim()?'var(--dark)':'var(--border)', color:'white', border:'none', cursor:input.trim()?'pointer':'not-allowed', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 }}>
              ↑
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:'fixed', bottom:24, right:24, width:56, height:56,
          borderRadius:'50%', background:'var(--dark)', color:'white',
          border:'none', cursor:'pointer', fontSize:24,
          boxShadow:'0 4px 24px rgba(0,0,0,.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform .2s, background .2s', zIndex:399,
        }}
        onMouseOver={e => e.currentTarget.style.background='var(--gold)'}
        onMouseOut={e => e.currentTarget.style.background='var(--dark)'}
        title="Chat with us">
        {open ? '×' : '💬'}
        {!open && unread > 0 && (
          <span style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:'50%', background:'var(--danger)', color:'white', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>
        )}
      </button>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
    </>
  );
}