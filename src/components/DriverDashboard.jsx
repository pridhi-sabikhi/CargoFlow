import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
function Counter({ target, prefix = "", suffix = "", duration = 1400 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let n = 0; const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => { n += step; if (n >= target) { setCount(target); clearInterval(t); } else setCount(n); }, 16);
    return () => clearInterval(t);
  }, [visible, target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
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
function CircleProgress({ pct, size = 92, stroke = 8, color = "#3b82f6", label = "" }) {
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
    <div ref={ref} style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eef2ff" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${(anim/100)*circ} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={size*0.17} fontWeight="700" fill="#0f172a">{Math.round(anim)}%</text>
      </svg>
      {label && <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, textAlign: "center", fontSize: 11, color: "#64748b" }}>{label}</div>}
    </div>
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
function Card({ children, style = {}, p = 22, onClick, highlight = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ 
        background: "#fff", 
        borderRadius: 16, 
        border: highlight ? "2px solid #f57c3a" : "1px solid #f1f5f9", 
        padding: p,
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,.10),0 2px 8px rgba(0,0,0,.05)" : "0 2px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .25s ease, transform .25s ease", 
        transform: hov ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style 
      }}>
      {children}
    </div>
  );
}

/* ─── Status Badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const config = {
    "in-transit": { bg: "#dbeafe", color: "#1d4ed8", label: "In Transit" },
    "delivered": { bg: "#dcfce7", color: "#166534", label: "Delivered" },
    "pending": { bg: "#fef3c7", color: "#b45309", label: "Pending" },
    "exception": { bg: "#fee2e2", color: "#991b1b", label: "Exception" },
    "on-route": { bg: "#dbeafe", color: "#1d4ed8", label: "On Route" },
    "at-stop": { bg: "#f3e8ff", color: "#6b21a8", label: "At Stop" }
  };
  const cfg = config[status] || config["pending"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.7 }} />
      {cfg.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   DRIVER DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function DriverDashboard() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [selectedShift, setSelectedShift] = useState("Today");
  const [activeTab, setActiveTab] = useState("overview");
  const [showBreakReminder, setShowBreakReminder] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Driver info
  const driver = {
    name: "Michael Chen",
    id: "DRV-3842",
    vehicle: "Truck T-842",
    shift: "Morning (6AM - 2PM)",
    status: "on-duty",
    rating: 4.92,
    totalTrips: 1248,
    avatar: "MC"
  };

  // Stats cards data
  const stats = [
    { label: "Today's Deliveries", icon: "📦", value: 24, target: 28, prefix: "", suffix: "", change: "+3", pos: true, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Completed", icon: "✅", value: 18, target: 24, prefix: "", suffix: "", change: "75%", pos: true, color: "#10b981", bg: "#ecfdf5" },
    { label: "Distance Today", icon: "📍", value: 156, prefix: "", suffix: "km", change: "+12 km", pos: true, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Est. Earnings", icon: "💰", value: 245, prefix: "$", suffix: "", change: "+$32", pos: true, color: "#8b5cf6", bg: "#f3f0ff" },
  ];

  // Today's route stops
  const routeStops = [
    { id: 1, customer: "Amaya Weller", address: "123 Main St, Apt 4B", time: "9:30 AM", status: "completed", type: "delivery", package: "#PKG-10254" },
    { id: 2, customer: "Sebastian Adams", address: "456 Oak Ave", time: "10:15 AM", status: "completed", type: "delivery", package: "#PKG-10255" },
    { id: 3, customer: "Suzanne Bright", address: "789 Pine Rd", time: "11:00 AM", status: "in-transit", type: "delivery", package: "#PKG-10256" },
    { id: 4, customer: "Peter Howl", address: "321 Elm St", time: "11:45 AM", status: "pending", type: "pickup", package: "#PKG-10257" },
    { id: 5, customer: "Anta Singh", address: "654 Cedar Ln", time: "12:30 PM", status: "pending", type: "delivery", package: "#PKG-10258" },
    { id: 6, customer: "Warehouse Return", address: "100 Distribution Ctr", time: "1:15 PM", status: "pending", type: "return", package: "#RMA-3302" },
  ];

  // Performance metrics
  const performance = [
    { metric: "On-Time Delivery", value: 94, target: 95, color: "#3b82f6" },
    { metric: "Customer Rating", value: 4.92, target: 5, color: "#10b981", suffix: "/5" },
    { metric: "Fuel Efficiency", value: 8.2, target: 10, color: "#f59e0b", suffix: "km/l" },
    { metric: "Break Compliance", value: 100, target: 100, color: "#8b5cf6", suffix: "%" },
  ];

  // Recent notifications
  const notifications = [
    { type: "route", msg: "New stop added to your route", time: "5 min ago", icon: "🔄", bg: "#eff6ff" },
    { type: "alert", msg: "Traffic ahead on I-95, expect 10 min delay", time: "15 min ago", icon: "⚠️", bg: "#fef2f2" },
    { type: "success", msg: "Package #PKG-10254 marked as delivered", time: "32 min ago", icon: "✅", bg: "#ecfdf5" },
    { type: "info", msg: "Break reminder: 4 hours driving completed", time: "1 hour ago", icon: "☕", bg: "#fffbeb" },
  ];

  // Earnings data
  const earnings = [
    { day: "Mon", amount: 185 },
    { day: "Tue", amount: 210 },
    { day: "Wed", amount: 195 },
    { day: "Thu", amount: 245 },
    { day: "Fri", amount: 230 },
    { day: "Sat", amount: 175 },
    { day: "Sun", amount: 0 },
  ];

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const row = (gap=12) => ({ display:"flex", alignItems:"center", gap });
  const col = (gap=12) => ({ display:"flex", flexDirection:"column", gap });
  const between = () => ({ display:"flex", alignItems:"center", justifyContent:"space-between" });
  const label = { fontSize:11.5, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" };
  const h3 = { fontSize:15, fontWeight:700, color:"#0f172a", letterSpacing:"-.3px" };

  // Navigate to tracker
  const goToTracker = () => {
    navigate("/tracker");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:ff }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;}
        .nav-link{padding:6px 14px;font-size:13.5px;font-weight:500;color:#64748b;text-decoration:none;border-radius:8px;transition:background .18s,color .18s;font-family:${ff};}
        .nav-link:hover{background:#f1f5f9;color:#0f172a;}
        .nav-link.active{background:#eff6ff;color:#3b82f6;}
        .route-stop:hover{background:#f8fafc!important;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        .break-reminder{animation:pulse 2s ease-in-out infinite;}
        select:focus{outline:2px solid #3b82f6;outline-offset:1px;}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, height:64, background: scrolled?"rgba(255,255,255,.97)":"rgba(255,255,255,.82)", backdropFilter:"blur(20px) saturate(180%)", WebkitBackdropFilter:"blur(20px) saturate(180%)", borderBottom:"1px solid rgba(232,236,240,.7)", boxShadow: scrolled?"0 1px 0 rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)":"none", transition:"all .3s ease", fontFamily:ff }}>
        <div style={{ maxWidth:1440, margin:"0 auto", height:"100%", ...between(), padding:"0 28px", gap:32 }}>
          <div style={row(10)}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#f57c3a"/>
              <path d="M8 15h14M15 8l7 7-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize:18, fontWeight:800, color:"#0f172a", letterSpacing:"-.5px" }}>DriverFlow</span>
          </div>
          
          <div style={row(24)}>
            <div style={row(16)}>
              <select value={selectedShift} onChange={e=>setSelectedShift(e.target.value)}
                style={{ padding:"7px 28px 7px 12px", fontFamily:ff, fontSize:13, fontWeight:500, color:"#0f172a", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", outline:"none", appearance:"none" }}>
                {["Today", "This Week", "This Month"].map(o=><option key={o}>{o}</option>)}
              </select>
              
              <div style={row(10)}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{driver.name}</div>
                  <div style={{ fontSize:11, color:"#f57c3a", fontWeight:500 }}>{driver.status}</div>
                </div>
                <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#f57c3a,#f59e0b)",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(245,124,58,.35)",userSelect:"none" }}>{driver.avatar}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1440, margin:"0 auto", padding:"28px 28px 56px", ...col(22) }}>

        {/* ── WELCOME BANNER ── */}
        <Reveal>
          <div style={{ 
            position:"relative", 
            background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#f57c3a 100%)", 
            borderRadius:20, 
            padding:"28px 36px", 
            overflow:"hidden", 
            display:"flex", 
            alignItems:"center", 
            justifyContent:"space-between",
            boxShadow:"0 12px 40px rgba(0,0,0,.18)"
          }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>
            
            {showBreakReminder && (
              <div style={{ position:"absolute", top:16, right:36, background:"rgba(255,255,255,.15)", backdropFilter:"blur(10px)", padding:"8px 16px", borderRadius:30, border:"1px solid rgba(255,255,255,.2)", fontSize:13, color:"#fff", display:"flex", alignItems:"center", gap:10, zIndex:2 }}>
                <span>☕ Time for a break? You've been driving 4 hours</span>
                <button 
                  onClick={() => setShowBreakReminder(false)}
                  style={{ background:"transparent", border:"none", color:"#fff", fontSize:16, cursor:"pointer", opacity:0.8 }}
                >×</button>
              </div>
            )}

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontSize:11.5, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase", marginBottom:12 }}>
                ● {driver.vehicle} • {driver.shift}
              </div>
              <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-1px", lineHeight:1.12 }}>
                Good afternoon, {driver.name.split(' ')[0]}!
              </h1>
              <p style={{ marginTop:8, fontSize:14, color:"rgba(255,255,255,.7)" }}>
                You have {routeStops.filter(s => s.status === "pending").length} pending stops today.
              </p>
            </div>
            
            <div style={{ display:"flex", gap:24, position:"relative", zIndex:1 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:800, color:"#fff" }}>{driver.rating}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.6)" }}>Rating</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:800, color:"#fff" }}>{driver.totalTrips}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.6)" }}>Total Trips</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── STAT CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
          {stats.map((s,i)=>(
            <Reveal key={i} delay={i*80}>
              <Card>
                <div style={between()}>
                  <div>
                    <p style={label}>{s.label}</p>
                    <p style={{ fontSize:30, fontWeight:800, color:"#0f172a", letterSpacing:"-1px", margin:"6px 0 8px", lineHeight:1 }}>
                      {s.prefix && <span style={{ fontSize:18, fontWeight:600, color:"#64748b" }}>{s.prefix}</span>}
                      <Counter target={s.value} suffix={s.suffix} duration={1400+i*100}/>
                    </p>
                    <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontSize:11.5, fontWeight:600, background:s.pos?"#dcfce7":"#fee2e2", color:s.pos?"#166534":"#991b1b" }}>
                      {s.change} vs target
                    </span>
                  </div>
                  <div style={{ width:48,height:48,borderRadius:12,background:s.bg,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.icon}</div>
                </div>
                <div style={{ marginTop:16 }}>
                  <div style={row(6)}>
                    <span style={{ fontSize:11, color:"#64748b" }}>Progress</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#0f172a", marginLeft:"auto" }}>{s.value}/{s.target}</span>
                  </div>
                  <ABar pct={(s.value/s.target)*100} color={s.color} delay={300+i*80}/>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
          {/* Left Column - Route & Deliveries */}
          <div style={col(20)}>
            {/* Tabs */}
            <Reveal>
              <Card p={16}>
                <div style={row(12)}>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    style={{ 
                      padding:"8px 20px", 
                      borderRadius:30, 
                      border:"none", 
                      fontSize:13, 
                      fontWeight:600, 
                      background: activeTab === "overview" ? "#f57c3a" : "#f1f5f9",
                      color: activeTab === "overview" ? "#fff" : "#64748b",
                      cursor:"pointer",
                      transition:"all .2s"
                    }}
                  >
                    Route Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("deliveries")}
                    style={{ 
                      padding:"8px 20px", 
                      borderRadius:30, 
                      border:"none", 
                      fontSize:13, 
                      fontWeight:600, 
                      background: activeTab === "deliveries" ? "#f57c3a" : "#f1f5f9",
                      color: activeTab === "deliveries" ? "#fff" : "#64748b",
                      cursor:"pointer",
                      transition:"all .2s"
                    }}
                  >
                    Deliveries
                  </button>
                  <button 
                    onClick={() => setActiveTab("pickups")}
                    style={{ 
                      padding:"8px 20px", 
                      borderRadius:30, 
                      border:"none", 
                      fontSize:13, 
                      fontWeight:600, 
                      background: activeTab === "pickups" ? "#f57c3a" : "#f1f5f9",
                      color: activeTab === "pickups" ? "#fff" : "#64748b",
                      cursor:"pointer",
                      transition:"all .2s"
                    }}
                  >
                    Pickups
                  </button>
                </div>
              </Card>
            </Reveal>

            {/* Route Stops */}
            <Reveal delay={60}>
              <Card p={0}>
                <div style={{ ...between(), padding:"22px 24px 16px" }}>
                  <p style={h3}>Today's Route</p>
                  <button 
                    onClick={goToTracker}
                    style={{ padding:"5px 14px", fontSize:12.5, fontWeight:600, color:"#f57c3a", background:"#fff", border:"1px solid #f57c3a", borderRadius:8, cursor:"pointer", fontFamily:ff }}
                  >
                    View Live Map
                  </button>
                </div>
                
                <div style={{ padding:"0 16px 16px" }}>
                  <div style={{ background:"#f8fafc", borderRadius:12, padding:12, marginBottom:16 }}>
                    <div style={row(16)}>
                      <div style={row(6)}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:"#10b981" }}/>
                        <span style={{ fontSize:12,color:"#64748b" }}>Start: Warehouse A</span>
                      </div>
                      <div style={{ fontSize:12,color:"#94a3b8" }}>→</div>
                      <div style={row(6)}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:"#f57c3a" }}/>
                        <span style={{ fontSize:12,color:"#64748b" }}>Current: Stop 3</span>
                      </div>
                      <div style={{ fontSize:12,color:"#94a3b8" }}>→</div>
                      <div style={row(6)}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:"#ef4444" }}/>
                        <span style={{ fontSize:12,color:"#64748b" }}>End: Depot</span>
                      </div>
                    </div>
                  </div>

                  <div style={col(8)}>
                    {routeStops.map((stop, i) => (
                      <div key={stop.id} className="route-stop" style={{ 
                        ...row(16), 
                        padding:"14px 12px", 
                        borderRadius:12,
                        background: stop.status === "in-transit" ? "#fff7ed" : "transparent",
                        border: stop.status === "in-transit" ? "1px solid #f57c3a" : "1px solid transparent",
                        cursor:"pointer"
                      }}>
                        <div style={{ 
                          width:32, 
                          height:32, 
                          borderRadius:"50%", 
                          background: stop.status === "completed" ? "#10b98120" : stop.status === "in-transit" ? "#f57c3a20" : "#f1f5f9",
                          display:"flex", 
                          alignItems:"center", 
                          justifyContent:"center",
                          color: stop.status === "completed" ? "#10b981" : stop.status === "in-transit" ? "#f57c3a" : "#94a3b8",
                          fontWeight:700,
                          fontSize:13
                        }}>
                          {i+1}
                        </div>
                        
                        <div style={{ flex:1 }}>
                          <div style={between()}>
                            <div>
                              <span style={{ fontWeight:600, fontSize:14, color:"#0f172a" }}>{stop.customer}</span>
                              <div style={row(8)}>
                                <span style={{ fontSize:12, color:"#64748b" }}>{stop.address}</span>
                                <span style={{ fontSize:11, color:"#94a3b8" }}>•</span>
                                <span style={{ fontSize:12, color: stop.type === "pickup" ? "#f59e0b" : stop.type === "return" ? "#ef4444" : "#3b82f6" }}>
                                  {stop.type}
                                </span>
                              </div>
                            </div>
                            <StatusBadge status={stop.status} />
                          </div>
                          
                          <div style={{ ...row(16), marginTop:6 }}>
                            <div style={row(4)}>
                              <span style={{ fontSize:11, color:"#94a3b8" }}>🕐</span>
                              <span style={{ fontSize:12, fontWeight:500, color:"#0f172a" }}>{stop.time}</span>
                            </div>
                            <div style={row(4)}>
                              <span style={{ fontSize:11, color:"#94a3b8" }}>📦</span>
                              <span style={{ fontSize:12, color:"#64748b" }}>{stop.package}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>

          {/* Right Column - Performance & Alerts */}
          <div style={col(20)}>
            {/* Performance Metrics */}
            <Reveal>
              <Card>
                <p style={{ ...h3, marginBottom:16 }}>Performance</p>
                <div style={col(16)}>
                  {performance.map((p, i) => (
                    <div key={i}>
                      <div style={between()}>
                        <span style={{ fontSize:13, color:"#475569" }}>{p.metric}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>
                          {p.value}{p.suffix || '%'} / {p.target}{p.suffix || '%'}
                        </span>
                      </div>
                      <ABar pct={(p.value/p.target)*100} color={p.color} delay={200+i*80}/>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #f1f5f9" }}>
                  <div style={row(16)}>
                    <CircleProgress pct={85} size={70} stroke={6} color="#f57c3a" label="Shift Progress"/>
                    <div style={col(4)}>
                      <div style={row(8)}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:"#f57c3a" }}/>
                        <span style={{ fontSize:12, color:"#64748b" }}>Next break in 45 min</span>
                      </div>
                      <div style={row(8)}>
                        <span style={{ width:8,height:8,borderRadius:"50%",background:"#10b981" }}/>
                        <span style={{ fontSize:12, color:"#64748b" }}>Est. completion: 2:30 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Earnings Preview */}
            <Reveal delay={80}>
              <Card>
                <div style={between()}>
                  <p style={h3}>Today's Earnings</p>
                  <span style={{ fontSize:20, fontWeight:800, color:"#0f172a" }}>$245</span>
                </div>
                
                <div style={{ marginTop:16 }}>
                  <div style={row(8)}>
                    <div style={{ flex:1 }}>
                      <div style={row(0)}>
                        {earnings.slice(0, 5).map((d, i) => (
                          <div key={i} style={{ flex:1, textAlign:"center" }}>
                            <div style={{ 
                              height: d.amount * 0.5, 
                              background: d.amount > 200 ? "#f57c3a" : "#fcd9b6",
                              width: "100%",
                              borderRadius: "4px 4px 0 0",
                              marginBottom: 4
                            }}/>
                            <span style={{ fontSize:10, color:"#64748b" }}>{d.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop:20, ...row(20) }}>
                    <div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Base Pay</span>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>$180</div>
                    </div>
                    <div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Incentives</span>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>$45</div>
                    </div>
                    <div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Tips</span>
                      <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>$20</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Notifications */}
            <Reveal delay={160}>
              <Card p={0}>
                <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid #f1f5f9" }}>
                  <p style={h3}>Alerts & Updates</p>
                </div>
                <div style={{ padding:8 }}>
                  {notifications.map((n, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10 }}>
                      <div style={{ width:32,height:32,borderRadius:10,background:n.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{n.icon}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, color:"#475569", lineHeight:1.5 }}>{n.msg}</p>
                        <span style={{ fontSize:11, color:"#94a3b8", marginTop:2, display:"block" }}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}