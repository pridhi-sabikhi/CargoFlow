import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { shipmentsAPI } from "../api";

/* ─── Scroll-reveal ──────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
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
    let n = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setCount(target); clearInterval(t); } else setCount(n);
    }, 16);
    return () => clearInterval(t);
  }, [visible, target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(22px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────── */
function Card({ children, style = {}, p = 22 }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #f1f5f9",
        padding: p,
        boxShadow: hov
          ? "0 12px 40px rgba(0,0,0,.10),0 2px 8px rgba(0,0,0,.05)"
          : "0 2px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .25s ease, transform .25s ease",
        transform: hov ? "translateY(-2px)" : "none",
        ...style
      }}>
      {children}
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────── */
const STATUS = {
  "Delivered":  { bg: "#dcfce7", color: "#166534" },
  "In Transit": { bg: "#dbeafe", color: "#1d4ed8" },
  "in-transit": { bg: "#dbeafe", color: "#1d4ed8" },
  "Pending":    { bg: "#fef3c7", color: "#b45309" },
  "pending":    { bg: "#fef3c7", color: "#b45309" },
  "Cancelled":  { bg: "#fee2e2", color: "#991b1b" },
  "delivered":  { bg: "#dcfce7", color: "#166534" },
};

/* ─── Generate unique referral code from user id + name ─────── */
function genReferral(userId = "", name = "") {
  const base = name.replace(/\s+/g, "").toUpperCase().slice(0, 3) || "USR";
  // Use userId chars to make it unique per user
  const hash = (userId + name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const num  = String((hash % 9000) + 1000);
  return `${base}${num}`;
}

/* ─── Sample fallback orders (shown when backend is offline) ─── */
const FALLBACK_ORDERS = [
  { shipmentId: "SH-482",  createdAt: "2026-04-20", destination: "Mumbai, MH",   weight: "2.5 kg", status: "in-transit" },
  { shipmentId: "SH-391",  createdAt: "2026-04-15", destination: "Delhi, DL",    weight: "1.2 kg", status: "delivered"  },
  { shipmentId: "SH-310",  createdAt: "2026-04-10", destination: "Bangalore, KA",weight: "4.0 kg", status: "delivered"  },
  { shipmentId: "SH-278",  createdAt: "2026-04-05", destination: "Hyderabad, TS",weight: "0.8 kg", status: "pending"    },
  { shipmentId: "SH-201",  createdAt: "2026-03-28", destination: "Chennai, TN",  weight: "3.3 kg", status: "delivered"  },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const navigate = useNavigate();
  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

  // ── Current user from localStorage ──────────────────────────
  const stored     = JSON.parse(localStorage.getItem("current_user") || "null");
  const userId     = stored?._id || stored?.id || stored?.email || "user";
  const userName   = stored?.name  || "Guest User";
  const userEmail  = stored?.email || "user@example.com";
  const userAvatar = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // ── State ────────────────────────────────────────────────────
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [copied,    setCopied]    = useState(false);
  const [toast,     setToast]     = useState({ show: false, msg: "" });

  const referralCode = genReferral(userId, userName);

  // ── Fetch shipments from API ─────────────────────────────────
  useEffect(() => {
    shipmentsAPI.list()
      .then(data => setOrders(Array.isArray(data) ? data : FALLBACK_ORDERS))
      .catch(() => setOrders(FALLBACK_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────
  const totalOrders     = orders.length;
  const activeShipments = orders.filter(o =>
    o.status === "in-transit" || o.status === "In Transit" || o.status === "pending" || o.status === "Pending"
  ).length;
  const referralEarning = 100; // 2 successful referrals × ₹50

  // ── Filter orders ────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const s = (o.status || "").toLowerCase();
    if (activeTab === "all")       return true;
    if (activeTab === "active")    return s === "in-transit" || s === "pending";
    if (activeTab === "delivered") return s === "delivered";
    return true;
  });

  // ── Helpers ──────────────────────────────────────────────────
  const copyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d || "—"; }
  };

  const label  = { fontSize: 11.5, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" };
  const h3     = { fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-.3px" };
  const row    = (gap = 12) => ({ display: "flex", alignItems: "center", gap });
  const col    = (gap = 12) => ({ display: "flex", flexDirection: "column", gap });
  const btwn   = () => ({ display: "flex", alignItems: "center", justifyContent: "space-between" });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: ff }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;}
        .ud-tab{padding:8px 20px;border-radius:30px;border:none;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:${ff};}
        .ud-tab:hover{background:#fff7ed;color:#f57c3a;}
        .ud-track-btn{padding:5px 14px;border-radius:8px;border:1px solid #f57c3a;background:#fff;color:#f57c3a;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s;font-family:${ff};}
        .ud-track-btn:hover{background:#f57c3a;color:#fff;}
        .ud-tr:hover td{background:#fafafa;}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 28px 56px", ...col(22) }}>

        {/* ── Welcome Banner ── */}
        <Reveal>
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#f57c3a 100%)",
            borderRadius: 20, padding: "28px 36px", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 12px 40px rgba(0,0,0,.18)"
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 12 }}>
                ● Customer Account
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1.12 }}>
                Welcome, {userName}!
              </h1>
              <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,.65)" }}>{userEmail}</p>
              <button onClick={() => navigate("/user/shipping-label")}
                style={{ marginTop: 14, background: "#FFAB00", border: "none", color: "#001F3F", padding: "9px 22px", borderRadius: 30, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: ff, display: "inline-flex", alignItems: "center", gap: 6 }}>
                🏷️ Create Shipping Label
              </button>
            </div>
            <div style={{ position: "relative", zIndex: 1, ...row(24) }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{totalOrders}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>Orders</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>₹{referralEarning}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>Referral Earned</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
          {[
            { label: "Total Orders",     icon: "📦", value: totalOrders,     color: "#3b82f6", bg: "#eff6ff", change: "All time" },
            { label: "Active Shipments", icon: "🚚", value: activeShipments, color: "#10b981", bg: "#ecfdf5", change: "In transit / Pending" },
            { label: "Referral Earning", icon: "💰", value: referralEarning, color: "#f57c3a", bg: "#fff7ed", change: "₹50 per referral", prefix: "₹" },
            { label: "Referral Code",    icon: "🎁", value: referralCode,    color: "#8b5cf6", bg: "#f3f0ff", isCode: true },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <Card>
                <div style={btwn()}>
                  <div>
                    <p style={label}>{s.label}</p>
                    {s.isCode ? (
                      <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: 2, margin: "6px 0 8px", fontFamily: "monospace" }}>{s.value}</p>
                    ) : (
                      <p style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", margin: "6px 0 8px", lineHeight: 1 }}>
                        {s.prefix && <span style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>{s.prefix}</span>}
                        <Counter target={typeof s.value === "number" ? s.value : 0} duration={1400 + i * 100} />
                      </p>
                    )}
                    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: s.bg, color: s.color }}>
                      {s.isCode ? (
                        <span style={{ cursor: "pointer" }} onClick={copyCode}>{copied ? "✓ Copied!" : "Click to copy"}</span>
                      ) : s.change}
                    </span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>

          {/* Left — Profile + Referral */}
          <div style={col(20)}>

            {/* Profile card */}
            <Reveal>
              <Card>
                <p style={{ ...h3, marginBottom: 18 }}>My Profile</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f57c3a,#f59e0b)", color: "#fff", fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(245,124,58,.35)" }}>
                    {userAvatar}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{userName}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{userEmail}</div>
                  </div>
                  <span style={{ background: "#fff7ed", color: "#f57c3a", border: "1px solid #fed7aa", borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 600 }}>Customer</span>
                </div>
                <div style={col(8)}>
                  {[
                    { icon: "📧", label: "Email",  val: userEmail },
                    { icon: "👤", label: "Name",   val: userName  },
                    { icon: "🎁", label: "Referral Code", val: referralCode },
                  ].map(r => (
                    <div key={r.label} style={{ ...row(10), padding: "9px 12px", background: "#f8fafc", borderRadius: 10 }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{r.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", fontFamily: r.label === "Referral Code" ? "monospace" : "inherit" }}>{r.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Referral card */}
            <Reveal delay={80}>
              <div style={{
                borderRadius: 16, padding: 24, overflow: "hidden",
                background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#f57c3a 100%)",
                boxShadow: "0 8px 24px rgba(0,0,0,.15)"
              }}>
                <div style={btwn()}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>🎁 Your Referral Code</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 4, fontFamily: "monospace" }}>{referralCode}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 6 }}>
                      Earn <b style={{ color: "#fbbf24" }}>₹50</b> for every friend who joins
                    </div>
                  </div>
                  <button
                    onClick={copyCode}
                    style={{ background: copied ? "#10b981" : "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", padding: "10px 20px", borderRadius: 30, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s", backdropFilter: "blur(6px)", fontFamily: ff }}
                  >
                    {copied ? "✓ Copied!" : "Copy Code"}
                  </button>
                </div>
                <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(255,255,255,.08)", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Referral Earnings</div>
                  <div style={{ ...row(16) }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24" }}>₹{referralEarning}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>Total earned</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>2</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>Successful</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#94a3b8" }}>1</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — Orders table */}
          <Reveal delay={60}>
            <Card p={0} style={{ height: "100%" }}>
              {/* Header */}
              <div style={{ ...btwn(), padding: "22px 24px 16px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={h3}>My Orders & Shipments</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {loading ? "Loading..." : `${filteredOrders.length} shipment${filteredOrders.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div style={row(8)}>
                  {["all", "active", "delivered"].map(t => (
                    <button key={t} className="ud-tab"
                      style={{ background: activeTab === t ? "#f57c3a" : "#f1f5f9", color: activeTab === t ? "#fff" : "#64748b" }}
                      onClick={() => setActiveTab(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Tracking ID", "Ship Date", "Destination", "Weight", "Status", "Action"].map(h => (
                        <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading shipments...</td></tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No shipments found</td></tr>
                    ) : filteredOrders.map((o, i) => {
                      const rawStatus = o.status || "Pending";
                      const displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).replace(/-/g, " ");
                      const st = STATUS[rawStatus] || STATUS["Pending"];
                      const trackId = o.shipmentId || o.id || `SH-${i + 100}`;
                      return (
                        <tr key={trackId} className="ud-tr" style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#f57c3a", fontSize: 14 }}>{trackId}</span>
                          </td>
                          <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>
                            {fmtDate(o.createdAt || o.shipDate)}
                          </td>
                          <td style={{ padding: "13px 20px", fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                            {o.destination || o.origin || "—"}
                          </td>
                          <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>
                            {o.weight || "—"}
                          </td>
                          <td style={{ padding: "13px 20px" }}>
                            <span style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {displayStatus}
                            </span>
                          </td>
                          <td style={{ padding: "13px 20px" }}>
                            <button className="ud-track-btn"
                              onClick={() => { navigate(`/customer-tracking/${trackId}`); showToast(`Tracking ${trackId}`); }}>
                              Track
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: "#f57c3a", color: "#0b1a2f", padding: "12px 24px", borderRadius: 40, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 24px rgba(245,124,58,.4)", zIndex: 9999, animation: "slideIn .3s ease", border: "2px solid #ffc59b" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
