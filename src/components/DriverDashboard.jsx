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
  const [activeTab, setActiveTab]         = useState("overview");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Driver info
  const driver = {
    name: "Rajesh Kumar",
    id: "DRV-3842",
    vehicle: "Truck T-842",
    shift: "Morning (6AM - 2PM)",
    status: "on-duty",
    rating: 4.92,
    totalTrips: 1248,
    avatar: "RK"
  };

  // Today's route stops
  const routeStops = [
    { id: 1, customer: "Priya Sharma",    address: "Bandra West, Mumbai",       time: "9:30 AM",  status: "completed",  type: "delivery", package: "#PKG-10254" },
    { id: 2, customer: "Amit Verma",      address: "Andheri East, Mumbai",      time: "10:15 AM", status: "completed",  type: "delivery", package: "#PKG-10255" },
    { id: 3, customer: "Sunita Patel",    address: "Dadar, Mumbai",             time: "11:00 AM", status: "in-transit", type: "delivery", package: "#PKG-10256" },
    { id: 4, customer: "Ravi Mehta",      address: "Kurla, Mumbai",             time: "11:45 AM", status: "pending",    type: "pickup",   package: "#PKG-10257" },
    { id: 5, customer: "Kavita Singh",    address: "Chembur, Mumbai",           time: "12:30 PM", status: "pending",    type: "delivery", package: "#PKG-10258" },
    { id: 6, customer: "Warehouse Return",address: "Bhiwandi Warehouse, Thane", time: "1:15 PM",  status: "pending",    type: "return",   package: "#RMA-3302"  },
  ];

  // Points system
  const POINTS_PER_DELIVERY = 5;
  const POINTS_TARGET        = 10000;
  const BONUS_AT_TARGET      = 5000;
  const completedDeliveries  = routeStops.filter(s => s.status === "completed").length;
  const totalPoints          = 8340 + completedDeliveries * POINTS_PER_DELIVERY;
  const pointsPct            = Math.min((totalPoints / POINTS_TARGET) * 100, 100);
  const pointsLeft           = Math.max(POINTS_TARGET - totalPoints, 0);
  const deliveriesLeft       = Math.ceil(pointsLeft / POINTS_PER_DELIVERY);

  // Stats cards
  const stats = [
    { label: "Today's Deliveries", icon: "📦", value: 24, target: 28, prefix: "", suffix: "", change: "+3", pos: true, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Completed", icon: "✅", value: 18, target: 24, prefix: "", suffix: "", change: "75%", pos: true, color: "#10b981", bg: "#ecfdf5" },
    { label: "Distance Today", icon: "📍", value: 156, prefix: "", suffix: "km", change: "+12 km", pos: true, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Points Today", icon: "⭐", value: completedDeliveries * POINTS_PER_DELIVERY, prefix: "+", suffix: " pts", change: `${completedDeliveries} deliveries`, pos: true, color: "#f57c3a", bg: "#fff7ed" },
  ];

  // Experience / career data
  const experience = {
    joinDate:      "March 2021",
    totalYears:    3,
    totalMonths:   4,
    totalShifts:   892,
    currentLevel:  "Senior Driver",
    nextLevel:     "Lead Driver",
    levelProgress: 72,
    tripsToNext:   252,
    badges: [
      { icon: "🏅", label: "On-Time King",    desc: "95%+ on-time 6 months",    earned: true  },
      { icon: "⭐", label: "5-Star Streak",   desc: "50 consecutive 5-star",    earned: true  },
      { icon: "🚀", label: "Speed Demon",     desc: "Fastest route completion", earned: true  },
      { icon: "🛡️", label: "Zero Incidents",  desc: "12 months incident-free",  earned: true  },
      { icon: "🌧️", label: "All-Weather Pro", desc: "100 rain/snow deliveries", earned: false },
      { icon: "💎", label: "Diamond Driver",  desc: "Reach Lead Driver level",  earned: false },
    ],
    milestones: [
      { label: "Joined",        date: "Mar 2021", done: true,  icon: "🚗" },
      { label: "Junior",        date: "Jun 2021", done: true,  icon: "📦" },
      { label: "Driver",        date: "Jan 2022", done: true,  icon: "🚚" },
      { label: "Senior",        date: "Sep 2023", done: true,  icon: "⭐" },
      { label: "Lead Driver",   date: "~2025",    done: false, icon: "🏆" },
    ],
    skills: [
      { name: "Route Efficiency", pct: 94, color: "#3b82f6" },
      { name: "Customer Service", pct: 98, color: "#10b981" },
      { name: "Vehicle Handling", pct: 88, color: "#f59e0b" },
      { name: "Time Management",  pct: 91, color: "#8b5cf6" },
    ],
  };

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const row = (gap=12) => ({ display:"flex", alignItems:"center", gap });
  const col = (gap=12) => ({ display:"flex", flexDirection:"column", gap });
  const between = () => ({ display:"flex", alignItems:"center", justifyContent:"space-between" });
  const label = { fontSize:11.5, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" };
  const h3 = { fontSize:15, fontWeight:700, color:"#0f172a", letterSpacing:"-.3px" };

  // Navigate to driver shipment map
  const goToTracker = () => {
    navigate("/driver/shipments");
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

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontSize:11.5, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase", marginBottom:12 }}>
                ● {driver.vehicle} • {driver.shift}
              </div>
              <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-1px", lineHeight:1.12 }}>
                Good afternoon, {driver.name.split(' ')[0]}!
              </h1>
            </div>
            
            <div style={{ position:"relative", zIndex:1 }}></div>
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
                    {routeStops
                      .filter(stop =>
                        activeTab === "overview"   ? true :
                        activeTab === "deliveries" ? stop.type === "delivery" :
                        activeTab === "pickups"    ? stop.type === "pickup" || stop.type === "return" :
                        true
                      )
                      .map((stop, i) => (
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

          {/* Right Column - Experience & Points & Alerts */}
          <div style={col(20)}>
            {/* ── EXPERIENCE CARD ── */}
            <Reveal>
              <Card>
                {/* Header */}
                <div style={{ ...between(), marginBottom:20 }}>
                  <div style={row(10)}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#f57c3a,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎖️</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Experience</p>
                      <p style={{ fontSize:11, color:"#94a3b8" }}>{driver.name}</p>
                    </div>
                  </div>
                </div>

                {/* 3 stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                  {/* Total Trips */}
                  <div style={{ background:"#eff6ff", borderRadius:16, padding:"18px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#3b82f6", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Total Trips</div>
                    <div style={{ fontSize:32, fontWeight:800, color:"#0f172a", letterSpacing:"-1px", lineHeight:1 }}>
                      <Counter target={driver.totalTrips} duration={1400} />
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:6 }}>deliveries completed</div>
                  </div>

                  {/* Shifts */}
                  <div style={{ background:"#f0fdf4", borderRadius:16, padding:"18px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#10b981", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Shift</div>
                    <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:"-0.5px", lineHeight:1.2 }}>
                      {driver.shift.includes("Morning") ? "🌅" : "🌙"}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#10b981", marginTop:6 }}>
                      {driver.shift.includes("Morning") ? "Morning" : "Evening"}
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>{driver.shift.replace(/.*\(/, "").replace(")", "")}</div>
                  </div>

                  {/* Years Active */}
                  <div style={{ background:"#fff7ed", borderRadius:16, padding:"18px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#f57c3a", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Years Active</div>
                    <div style={{ fontSize:32, fontWeight:800, color:"#0f172a", letterSpacing:"-1px", lineHeight:1 }}>
                      {experience.totalYears}<span style={{ fontSize:16, fontWeight:600, color:"#f57c3a" }}> yrs</span>
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:6 }}>on the road</div>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* ── POINTS CARD ── */}
            <Reveal delay={80}>
              <Card highlight={pointsLeft === 0}>
                {/* Header */}
                <div style={between()}>
                  <div style={row(8)}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#f57c3a,#f59e0b)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⭐</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>Delivery Points</p>
                      <p style={{ fontSize:11, color:"#94a3b8" }}>5 pts per delivery</p>
                    </div>
                  </div>
                  {pointsLeft === 0 ? (
                    <span style={{ background:"#dcfce7", color:"#166534", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>🎉 BONUS UNLOCKED</span>
                  ) : (
                    <span style={{ background:"#fff7ed", color:"#c2410c", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>+₹5,000 at 10k</span>
                  )}
                </div>

                {/* Big points number */}
                <div style={{ textAlign:"center", margin:"20px 0 8px" }}>
                  <div style={{ fontSize:42, fontWeight:800, color:"#0f172a", letterSpacing:"-2px", lineHeight:1 }}>
                    <Counter target={totalPoints} duration={1600} />
                  </div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>
                    of {POINTS_TARGET.toLocaleString()} pts
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ margin:"12px 0 6px" }}>
                  <div style={{ height:12, background:"#f1f5f9", borderRadius:8, overflow:"hidden", position:"relative" }}>
                    <ABar pct={pointsPct} color={pointsLeft === 0 ? "#10b981" : "#f57c3a"} delay={300} />
                    {/* milestone tick at 100% */}
                    <div style={{ position:"absolute", right:0, top:0, bottom:0, width:2, background:"#f57c3a", opacity:0.4 }} />
                  </div>
                  <div style={{ ...between(), marginTop:5 }}>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>0</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#f57c3a" }}>{pointsPct.toFixed(1)}%</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>10,000</span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:14, padding:"14px 0", borderTop:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#f57c3a" }}>
                      <Counter target={completedDeliveries * POINTS_PER_DELIVERY} duration={1200} />
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>Today's pts</div>
                  </div>
                  <div style={{ textAlign:"center", borderLeft:"1px solid #f1f5f9", borderRight:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>
                      {pointsLeft > 0 ? <Counter target={pointsLeft} duration={1400} /> : "0"}
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>Pts to bonus</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#10b981" }}>
                      {pointsLeft > 0 ? <Counter target={deliveriesLeft} duration={1200} /> : "✓"}
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>Deliveries left</div>
                  </div>
                </div>

                {/* Bonus info */}
                <div style={{ marginTop:14, background: pointsLeft === 0 ? "#dcfce7" : "#fff7ed", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:22 }}>{pointsLeft === 0 ? "🎉" : "🏆"}</div>
                  <div>
                    {pointsLeft === 0 ? (
                      <>
                        <div style={{ fontSize:13, fontWeight:700, color:"#166534" }}>Bonus Unlocked! +₹5,000 added to salary</div>
                        <div style={{ fontSize:11, color:"#4ade80", marginTop:2 }}>Congratulations! Keep delivering to earn more.</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize:13, fontWeight:700, color:"#c2410c" }}>₹5,000 salary bonus at 10,000 pts</div>
                        <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                          {deliveriesLeft} more deliveries needed · {POINTS_PER_DELIVERY} pts each
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Today's breakdown */}
                <div style={{ marginTop:14, ...row(16) }}>
                  <div style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{completedDeliveries}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>Delivered today</div>
                  </div>
                  <div style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#f57c3a" }}>+{completedDeliveries * POINTS_PER_DELIVERY}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>Points earned</div>
                  </div>
                  <div style={{ flex:1, background:"#f8fafc", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#8b5cf6" }}>₹{((totalPoints / POINTS_TARGET) * BONUS_AT_TARGET).toFixed(0)}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>Bonus earned</div>
                  </div>
                </div>
              </Card>
            </Reveal>

          </div>
        </div>
      </div>
    </div>
  );
}