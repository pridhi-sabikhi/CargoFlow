import { useState, useEffect, useRef } from "react";

/* ─── Scroll-reveal hook ─────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Animated counter ───────────────────────────────────────── */
function Counter({ target, prefix = "", duration = 1400 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let n = 0; const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => { n += step; if (n >= target) { setCount(target); clearInterval(t); } else setCount(n); }, 16);
    return () => clearInterval(t);
  }, [visible, target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}</span>;
}

/* ─── Animated bar ───────────────────────────────────────────── */
function ABar({ pct, color = "#3b82f6", delay = 0 }) {
  const [w, setW] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => { if (!visible) return; const t = setTimeout(() => setW(pct), delay); return () => clearTimeout(t); }, [visible, pct, delay]);
  return (
    <div ref={ref} style={{ height: 7, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 4, transition: "width 0.9s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

/* ─── Circular progress ──────────────────────────────────────── */
function CircleProgress({ pct, size = 92, stroke = 8, color = "#3b82f6" }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let frame; const start = performance.now(), dur = 1200;
    const run = now => { const t = Math.min((now - start) / dur, 1), ease = 1 - Math.pow(1 - t, 3); setAnim(ease * pct); if (t < 1) frame = requestAnimationFrame(run); };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [visible, pct]);
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eef2ff" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(anim/100)*circ} ${circ}`} strokeDashoffset={circ*0.25}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={size*0.17} fontWeight="700" fill="#0f172a">{Math.round(anim)}%</text>
    </svg>
  );
}

/* ─── Donut chart ────────────────────────────────────────────── */
function Donut({ segs, size = 120, stroke = 18 }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {segs.map((s, i) => {
        const dash = (s.pct / 100) * circ, offset = circ - cum * circ / 100;
        cum += s.pct;
        return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dasharray .8s ease" }} />;
      })}
    </svg>
  );
}

/* ─── SVG Line Chart ─────────────────────────────────────────── */
function LineChart({ rev, ord, months }) {
  const [hov, setHov] = useState(null);
  const W = 560, H = 175, P = { t: 10, r: 10, b: 28, l: 36 };
  const all = [...rev, ...ord], maxV = Math.max(...all) * 1.1, minV = Math.min(...all) * 0.9;
  const x = i => P.l + (i / (rev.length - 1)) * (W - P.l - P.r);
  const y = v => P.t + (1 - (v - minV) / (maxV - minV)) * (H - P.t - P.b);
  const line = d => d.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = d => `M${x(0)},${y(d[0])} ${d.map((v,i)=>`L${x(i)},${y(v)}`).join(" ")} L${x(d.length-1)},${H-P.b} L${x(0)},${H-P.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:185, display:"block", cursor:"crosshair" }}
      onMouseLeave={() => setHov(null)}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".22"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient>
        <linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".18"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {[0,1,2,3,4].map(i => { const yy = P.t + (i/4)*(H-P.t-P.b); return <line key={i} x1={P.l} x2={W-P.r} y1={yy} y2={yy} stroke="#f0f4f8" strokeWidth="1"/>; })}
      {[0,1,2,3,4].map(i => { const v = maxV - (i/4)*(maxV-minV); const yy = P.t + (i/4)*(H-P.t-P.b); return <text key={i} x={P.l-4} y={yy+4} textAnchor="end" fontSize="9" fill="#cbd5e1">{(v/1000).toFixed(0)}k</text>; })}
      {months.map((m, i) => <text key={i} x={x(i)} y={H-4} textAnchor="middle" fontSize="9" fill="#cbd5e1">{m}</text>)}
      <path d={area(rev)} fill="url(#rg)"/><path d={area(ord)} fill="url(#og)"/>
      <path d={line(rev)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#gl)"/>
      <path d={line(ord)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#gl)"/>
      {rev.map((v, i) => (
        <g key={i}>
          <rect x={x(i)-22} y={0} width={44} height={H} fill="transparent" onMouseEnter={() => setHov(i)}/>
          {hov===i && <>
            <line x1={x(i)} x2={x(i)} y1={P.t} y2={H-P.b} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3"/>
            <circle cx={x(i)} cy={y(v)} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2"/>
            <circle cx={x(i)} cy={y(ord[i])} r="5" fill="#10b981" stroke="#fff" strokeWidth="2"/>
            <rect x={x(i)-44} y={y(v)-38} width="88" height="32" rx="7" fill="#1e293b" opacity=".92"/>
            <text x={x(i)} y={y(v)-24} textAnchor="middle" fontSize="9" fill="#94a3b8">{months[i]}</text>
            <text x={x(i)-4} y={y(v)-11} textAnchor="end" fontSize="9" fill="#93c5fd">₹{(v/1000).toFixed(1)}k</text>
            <text x={x(i)+4} y={y(v)-11} textAnchor="start" fontSize="9" fill="#6ee7b7">₹{(ord[i]/1000).toFixed(1)}k</text>
          </>}
        </g>
      ))}
    </svg>
  );
}

/* ─── Reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────── */
function Card({ children, style = {}, p = 22 }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: p,
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,.10),0 2px 8px rgba(0,0,0,.05)" : "0 2px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .25s ease, transform .25s ease", transform: hov ? "translateY(-2px)" : "none", ...style }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState("This Month");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const stats = [
    { label:"Total Sales",    icon:"💰", num:983410, prefix:"₹", change:"+3.36%", pos:true,  color:"#3b82f6", bg:"#eff6ff" },
    { label:"Total Orders",   icon:"📦", num:58375,  prefix:"",  change:"-2.89%", pos:false, color:"#f59e0b", bg:"#fffbeb" },
    { label:"Total Visitors", icon:"👥", num:237782, prefix:"",  change:"+8.02%", pos:true,  color:"#10b981", bg:"#ecfdf5" },
  ];
  const cats = [
    { name:"Electronics",           val:"₹3,400,000", color:"#3b82f6", pct:45 },
    { name:"Fashion",               val:"₹1,200,000", color:"#10b981", pct:25 },
    { name:"Home & Kitchen",        val:"₹595,000",   color:"#f59e0b", pct:15 },
    { name:"Beauty & Personal Care",val:"₹575,000",   color:"#8b5cf6", pct:10 },
    { name:"Sports & Outdoors",     val:"₹550,000",   color:"#ef4444", pct:5  },
  ];
  const revD  = [32000,28000,35000,30000,38000,42000,45000,40000,38000,42000,48000,52000];
  const ordD  = [28000,25000,32000,28000,35000,38000,40000,36000,34000,38000,42000,45000];
  const months= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const orders= [
    { no:1, id:"#10254", cust:"Amaya Weller",    prod:"Wireless Headphones", qty:2, date:"12-Aug", st:"Shipped",    amt:"₹100" },
    { no:2, id:"#10255", cust:"Sebastian Adams", prod:"Running Shoes",        qty:1, date:"12-Aug", st:"Processing", amt:"₹75"  },
    { no:3, id:"#10256", cust:"Suzanne Bright",  prod:"Smartwatch",           qty:1, date:"12-Aug", st:"Shipped",    amt:"₹150" },
    { no:4, id:"#10257", cust:"Peter Howl",      prod:"Coffee Maker",         qty:1, date:"12-Aug", st:"Processing", amt:"₹60"  },
    { no:5, id:"#10258", cust:"Anta Singh",      prod:"Bluetooth Speaker",    qty:3, date:"12-Aug", st:"Shipped",    amt:"₹50"  },
  ];
  const activity = [
    { user:"Mayreen Steel",  msg:"purchased 2 items totaling ₹300",                       type:"purchase", time:"2 min ago"   },
    { user:null,             msg:'Price of "Smart TV" updated from ₹500 to ₹450',         type:"update",   time:"15 min ago"  },
    { user:"Whomit Laurent", msg:'left a 5-star review for "Wireless Headphones"',        type:"review",   time:"1 hour ago"  },
    { user:null,             msg:"Running Shoes stock is below 10 units",                  type:"alert",    time:"3 hours ago" },
    { user:"Damien Ugo's",   msg:'order changed from "Pending" to "Processing"',           type:"status",   time:"5 hours ago" },
  ];
  const traffic = [
    { src:"Direct Traffic",   pct:40, color:"#3b82f6" },
    { src:"Organic Search",   pct:30, color:"#10b981" },
    { src:"Social Media",     pct:15, color:"#f59e0b" },
    { src:"Referral Traffic", pct:10, color:"#8b5cf6" },
    { src:"Email Campaigns",  pct:5,  color:"#ef4444" },
  ];
  const locs = [
    { country:"United States",  pct:36,   val:366 },
    { country:"United Kingdom", pct:24,   val:244 },
    { country:"Indonesia",      pct:17.5, val:175 },
    { country:"Russia",         pct:15,   val:150 },
    { country:"Others",         pct:7.5,  val:75  },
  ];
  const actIcon = { purchase:"🛒", update:"✏️", review:"⭐", alert:"⚠️", status:"🔄" };
  const actBg   = { purchase:"#ecfdf5", update:"#eff6ff", review:"#fffbeb", alert:"#fef2f2", status:"#f3f0ff" };

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const row = (gap=12) => ({ display:"flex", alignItems:"center", gap });
  const col = (gap=12) => ({ display:"flex", flexDirection:"column", gap });
  const between = () => ({ display:"flex", alignItems:"center", justifyContent:"space-between" });
  const label = { fontSize:11.5, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" };
  const h3 = { fontSize:15, fontWeight:700, color:"#0f172a", letterSpacing:"-.3px" };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:ff }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;}
        .nl{padding:6px 14px;font-size:13.5px;font-weight:500;color:#64748b;text-decoration:none;border-radius:8px;transition:background .18s,color .18s;font-family:${ff};}
        .nl:hover{background:#f1f5f9;color:#0f172a;}
        .nl.act{background:#eff6ff;color:#3b82f6;}
        .tr:hover{background:#f8faff!important;}
        .ai:hover{background:#f8fafc!important;}
        .trow:hover{background:#f8fafc!important;}
        @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)}50%{box-shadow:0 0 0 6px rgba(59,130,246,0)}}
        @keyframes bgrow{from{width:0}to{width:85%}}
        @keyframes sparkle{0%,100%{opacity:.5}50%{opacity:.9}}
        .spark{animation:sparkle 3s ease-in-out infinite;}
        select:focus{outline:2px solid #3b82f6;outline-offset:1px;}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, height:64, background: scrolled?"rgba(255,255,255,.97)":"rgba(255,255,255,.82)", backdropFilter:"blur(20px) saturate(180%)", WebkitBackdropFilter:"blur(20px) saturate(180%)", borderBottom:"1px solid rgba(232,236,240,.7)", boxShadow: scrolled?"0 1px 0 rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)":"none", transition:"all .3s ease", fontFamily:ff }}>
        <div style={{ maxWidth:1440, margin:"0 auto", height:"100%", ...between(), padding:"0 28px", gap:32 }}>
          <div style={row(10)}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#3b82f6"/>
              <path d="M8 15h14M15 8l7 7-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize:18, fontWeight:800, color:"#0f172a", letterSpacing:"-.5px" }}>CargoFlow</span>
          </div>
          <div style={row(12)}>
            <select value={dateRange} onChange={e=>setDateRange(e.target.value)}
              style={{ padding:"7px 28px 7px 12px", fontFamily:ff, fontSize:13, fontWeight:500, color:"#0f172a", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", outline:"none", appearance:"none" }}>
              {["Today","This Week","This Month","This Year"].map(o=><option key={o}>{o}</option>)}
            </select>
            <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#3b82f6,#818cf8)",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(59,130,246,.35)",userSelect:"none" }}>AW</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1440, margin:"0 auto", padding:"28px 28px 56px", ...col(22) }}>

        {/* ── HERO ── */}
        <Reveal>
          <div style={{ position:"relative", background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%)", borderRadius:20, padding:"44px 48px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:160, boxShadow:"0 12px 40px rgba(0,0,0,.18)" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", right:-80, top:-80, width:320, height:320, background:"radial-gradient(circle,rgba(96,165,250,.25) 0%,transparent 65%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(59,130,246,.2)", border:"1px solid rgba(59,130,246,.3)", color:"#93c5fd", fontSize:11.5, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase", marginBottom:12, animation:"pulseDot 2.4s ease-in-out infinite" }}>
                ● Live Dashboard
              </div>
              <h1 style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-1px", lineHeight:1.12 }}>
                Welcome back,<br/>
                <span style={{ background:"linear-gradient(90deg,#60a5fa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Admin</span>
              </h1>
              <p style={{ marginTop:8, fontSize:14, color:"rgba(255,255,255,.5)" }}>Your operations at a glance — updated in real time.</p>
            </div>
            <svg viewBox="0 0 220 60" fill="none" className="spark" style={{ width:240, flexShrink:0, position:"relative", zIndex:1 }}>
              <polyline points="0,45 20,35 40,40 60,20 80,30 100,15 120,22 140,10 160,18 180,8 200,12 220,6" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".55"/>
              <polyline points="0,55 20,48 40,52 60,38 80,44 100,32 120,38 140,28 160,34 180,22 200,28 220,20" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".4"/>
              {[100,140,180].map((px,i)=><circle key={i} cx={px} cy={[15,10,8][i]} r="3.5" fill={["#60a5fa","#60a5fa","#34d399"][i]} opacity=".8"/>)}
            </svg>
          </div>
        </Reveal>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {stats.map((s,i)=>(
            <Reveal key={i} delay={i*80}>
              <Card style={{ overflow:"hidden" }}>
                <div style={between()}>
                  <div>
                    <p style={label}>{s.label}</p>
                    <p style={{ fontSize:30, fontWeight:800, color:"#0f172a", letterSpacing:"-1px", margin:"6px 0 8px", lineHeight:1 }}>
                      {s.prefix && <span style={{ fontSize:18, fontWeight:600, color:"#64748b" }}>{s.prefix}</span>}
                      <Counter target={s.num} duration={1400+i*100}/>
                    </p>
                    <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:11.5, fontWeight:600, background:s.pos?"#dcfce7":"#fee2e2", color:s.pos?"#166534":"#991b1b" }}>
                      {s.change} vs last week
                    </span>
                  </div>
                  <div style={{ width:48,height:48,borderRadius:12,background:s.bg,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.icon}</div>
                </div>
                <div style={{ height:3, background:"#f1f5f9", marginTop:16, borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:s.color, width:s.pos?"72%":"38%", borderRadius:2, transition:"width 1.2s ease .4s" }}/>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* ── CATEGORIES + REVENUE ── */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr", gap:20 }}>
          <Reveal>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Top Categories</p>
              <div style={col(14)}>
                {cats.map((c,i)=>(
                  <div key={i} style={col(5)}>
                    <div style={row(8)}>
                      <span style={{ width:10,height:10,borderRadius:3,background:c.color,flexShrink:0 }}/>
                      <span style={{ flex:1,fontSize:13,color:"#475569",fontWeight:500 }}>{c.name}</span>
                      <span style={{ fontSize:12.5,fontWeight:700,color:"#0f172a" }}>{c.val}</span>
                    </div>
                    <ABar pct={c.pct} color={c.color} delay={300+i*80}/>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={60}>
            <Card>
              <div style={{ ...between(), marginBottom:16 }}>
                <p style={h3}>Revenue Analytics</p>
                <div style={row(16)}>
                  {[["#3b82f6","Revenue","₹14,521"],["#10b981","Orders","₹14,521"]].map(([c,l,v],i)=>(
                    <span key={i} style={row(6)}>
                      <span style={{ width:10,height:10,borderRadius:"50%",background:c }}/>
                      <span style={{ fontSize:12,color:"#64748b" }}>{l}</span>
                      <strong style={{ fontSize:12,color:"#0f172a" }}>{v}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <LineChart rev={revD} ord={ordD} months={months}/>
            </Card>
          </Reveal>
        </div>

        {/* ── MIDDLE ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr .9fr", gap:20 }}>
          {/* Monthly Target */}
          <Reveal>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Monthly Target</p>
              <div style={row(18)}>
                <CircleProgress pct={85}/>
                <div style={{ flex:1 }}>
                  <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden", marginBottom:6 }}>
                    <div style={{ height:"100%", background:"linear-gradient(90deg,#3b82f6,#60a5fa)", borderRadius:4, animation:"bgrow 1.3s ease forwards .6s", width:0 }}/>
                  </div>
                  <span style={{ fontSize:12, color:"#10b981", fontWeight:500 }}>+18.22% forecast month</span>
                  <p style={{ fontSize:13, color:"#64748b", marginTop:10, lineHeight:1.55 }}>
                    <strong style={{ color:"#0f172a" }}>Great Progress!</strong> Improving sales, gross margin and net profit month on month
                  </p>
                </div>
              </div>
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:14, marginTop:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", fontSize:11.5, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".04em", marginBottom:8 }}>
                  <span>Month</span><span>Target</span><span>Actual</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", fontSize:13, color:"#64748b" }}>
                  <span>12-Aug</span><span>₹600,000</span><span style={{ color:"#10b981", fontWeight:700 }}>₹610,000</span>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Active Users */}
          <Reveal delay={80}>
            <Card>
              <p style={h3}>Active Users</p>
              <p style={{ fontSize:28, fontWeight:800, color:"#0f172a", letterSpacing:"-1px", margin:"6px 0 4px" }}>2,758</p>
              <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:11.5, fontWeight:600, background:"#dcfce7", color:"#166534", marginBottom:16 }}>+6.02% from last month</span>
              <div style={col(10)}>
                {locs.map((l,i)=>(
                  <div key={i} style={col(4)}>
                    <div style={{ ...row(6), fontSize:12.5 }}>
                      <span style={{ flex:1, color:"#64748b" }}>{l.country}</span>
                      <span style={{ fontWeight:700, color:"#0f172a" }}>{l.val}</span>
                      <span style={{ color:"#94a3b8", fontSize:11, minWidth:32, textAlign:"right" }}>{l.pct}%</span>
                    </div>
                    <ABar pct={l.pct} delay={200+i*80}/>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Conversion Rate */}
          <Reveal delay={160}>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Conversion Rate</p>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:14, position:"relative" }}>
                <Donut segs={[{pct:68,color:"#10b981"},{pct:32,color:"#f0fdf4"}]} size={110} stroke={16}/>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:18, fontWeight:800, color:"#0f172a" }}>68%</div>
              </div>
              <div style={col(0)}>
                {[["Product","₹25,000"],["Sales","₹16,000"],["Gross Margin","10%"]].map(([l,v],i)=>(
                  <div key={i} style={{ ...between(), padding:"10px 0", borderBottom:i<2?"1px solid #f1f5f9":"none", fontSize:13 }}>
                    <span style={{ color:"#64748b" }}>{l}</span>
                    <span style={{ fontWeight:700, color:"#0f172a" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2.2fr 1.5fr", gap:20 }}>
          {/* Traffic */}
          <Reveal>
            <Card>
              <p style={{ ...h3, marginBottom:14 }}>Traffic Sources</p>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
                <Donut segs={traffic.map(t=>({pct:t.pct,color:t.color}))} size={130} stroke={20}/>
              </div>
              <div style={col(0)}>
                {traffic.map((t,i)=>(
                  <div key={i} className="trow" style={{ ...between(), padding:"8px 6px", borderBottom:i<traffic.length-1?"1px solid #f1f5f9":"none", fontSize:13, borderRadius:6, cursor:"default" }}>
                    <div style={row(8)}>
                      <span style={{ width:9,height:9,borderRadius:"50%",background:t.color,flexShrink:0 }}/>
                      <span style={{ color:"#475569" }}>{t.src}</span>
                    </div>
                    <span style={{ fontWeight:700, color:"#0f172a" }}>{t.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Recent Orders */}
          <Reveal delay={80}>
            <Card p={0}>
              <div style={{ ...between(), padding:"22px 24px 0" }}>
                <p style={h3}>Recent Orders</p>
                <button style={{ padding:"5px 14px", fontSize:12.5, fontWeight:600, color:"#3b82f6", background:"#eff6ff", border:"1px solid rgba(59,130,246,.2)", borderRadius:8, cursor:"pointer", fontFamily:ff }}>View All</button>
              </div>
              <div style={{ overflowX:"auto", marginTop:14 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:640 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
                      {["No","Order ID","Customer","Product","Qty","Date","Status","Amount"].map(h=>(
                        <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11.5, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id} className="tr" style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"12px 16px", color:"#94a3b8", fontSize:12 }}>{o.no}</td>
                        <td style={{ padding:"12px 16px", fontWeight:700, color:"#3b82f6" }}>{o.id}</td>
                        <td style={{ padding:"12px 16px", color:"#475569" }}>{o.cust}</td>
                        <td style={{ padding:"12px 16px", color:"#475569" }}>{o.prod}</td>
                        <td style={{ padding:"12px 16px", color:"#475569", textAlign:"center" }}>{o.qty}</td>
                        <td style={{ padding:"12px 16px", color:"#475569" }}>{o.date}</td>
                        <td style={{ padding:"12px 16px" }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, background:o.st==="Shipped"?"#dbeafe":"#fef3c7", color:o.st==="Shipped"?"#1d4ed8":"#b45309" }}>
                            <span style={{ width:6,height:6,borderRadius:"50%",background:"currentColor",opacity:.7 }}/>{o.st}
                          </span>
                        </td>
                        <td style={{ padding:"12px 16px", fontWeight:700, color:"#0f172a" }}>{o.amt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Reveal>

          {/* Activity */}
          <Reveal delay={160}>
            <Card p={0}>
              <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid #f1f5f9" }}>
                <p style={h3}>Recent Activity</p>
              </div>
              <div style={{ padding:8 }}>
                {activity.map((a,i)=>(
                  <div key={i} className="ai" style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, cursor:"default" }}>
                    <div style={{ width:32,height:32,borderRadius:10,background:actBg[a.type],display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{actIcon[a.type]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, color:"#475569", lineHeight:1.5 }}>
                        {a.user && <strong style={{ color:"#0f172a", fontWeight:600 }}>{a.user} </strong>}
                        {a.msg}
                      </p>
                      <span style={{ fontSize:11, color:"#94a3b8", marginTop:2, display:"block" }}>{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

      </div>
    </div>
  );
}
