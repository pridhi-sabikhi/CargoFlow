// ManagerDashboard.jsx
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

/* ─── Team Member Card ───────────────────────────────────────── */
function TeamMember({ name, role, performance, avatar, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: "#fff" }}>
        {avatar}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{name}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}>{performance}%</span>
        </div>
        <span style={{ fontSize: 12, color: "#64748b" }}>{role}</span>
        <div style={{ marginTop: 6, height: 5, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${performance}%`, height: "100%", background: color, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Task Item ─────────────────────────────────────────────── */
function TaskItem({ task, assignee, priority, due, status }) {
  const priorityColors = {
    High: { bg: "#fee2e2", color: "#991b1b" },
    Medium: { bg: "#fffbeb", color: "#b45309" },
    Low: { bg: "#ecfdf5", color: "#166534" }
  };
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input type="checkbox" style={{ width: 18, height: 18, accentColor: "#3b82f6" }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{task}</p>
          <span style={{ fontSize: 12, color: "#64748b" }}>{assignee}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ padding: "4px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: priorityColors[priority].bg, color: priorityColors[priority].color }}>
          {priority}
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{due}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MANAGER DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function ManagerDashboard() {
  const [dateRange, setDateRange] = useState("This Week");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Manager-specific data
  const teamStats = [
    { label: "Team Members", icon: "👥", num: 24, prefix: "", change: "+2", pos: true, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Active Projects", icon: "📊", num: 8, prefix: "", change: "+3", pos: true, color: "#10b981", bg: "#ecfdf5" },
    { label: "Team Performance", icon: "📈", num: 94, prefix: "", change: "+5.2%", pos: true, color: "#f59e0b", bg: "#fffbeb" },
  ];

  const teamMembers = [
    { name: "Sarah Johnson", role: "Senior Developer", performance: 98, avatar: "SJ", color: "#3b82f6" },
    { name: "Michael Chen", role: "UX Designer", performance: 92, avatar: "MC", color: "#10b981" },
    { name: "Priya Patel", role: "Product Manager", performance: 96, avatar: "PP", color: "#8b5cf6" },
    { name: "David Kim", role: "Frontend Lead", performance: 94, avatar: "DK", color: "#f59e0b" },
    { name: "Emma Wilson", role: "QA Engineer", performance: 88, avatar: "EW", color: "#ef4444" },
    { name: "James Lee", role: "Backend Developer", performance: 91, avatar: "JL", color: "#06b6d4" },
  ];

  const tasks = [
    { task: "Update Q4 roadmap", assignee: "Sarah Johnson", priority: "High", due: "Today", status: "pending" },
    { task: "Review pull requests", assignee: "David Kim", priority: "Medium", due: "Tomorrow", status: "pending" },
    { task: "Team meeting agenda", assignee: "Priya Patel", priority: "Low", due: "Wed", status: "completed" },
    { task: "Performance reviews", assignee: "Michael Chen", priority: "High", due: "Fri", status: "pending" },
    { task: "Update documentation", assignee: "Emma Wilson", priority: "Medium", due: "Next week", status: "pending" },
    { task: "Client presentation", assignee: "James Lee", priority: "High", due: "Today", status: "pending" },
  ];

  const projects = [
    { name: "Website Redesign", progress: 75, team: 4, deadline: "Oct 15", color: "#3b82f6" },
    { name: "Mobile App Launch", progress: 45, team: 6, deadline: "Nov 30", color: "#10b981" },
    { name: "API Integration", progress: 90, team: 3, deadline: "Oct 5", color: "#f59e0b" },
    { name: "Database Migration", progress: 60, team: 2, deadline: "Dec 10", color: "#8b5cf6" },
    { name: "Security Audit", progress: 30, team: 3, deadline: "Jan 15", color: "#ef4444" },
  ];

  const activity = [
    { user: "Sarah Johnson", action: "completed task", target: "UI Design", time: "10 min ago", type: "complete", icon: "✅" },
    { user: "David Kim", action: "submitted PR", target: "feature/auth", time: "25 min ago", type: "pr", icon: "🔄" },
    { user: "Priya Patel", action: "created new task", target: "Q4 Planning", time: "1 hour ago", type: "create", icon: "📝" },
    { user: "Michael Chen", action: "commented on", target: "Design System", time: "2 hours ago", type: "comment", icon: "💬" },
    { user: "Emma Wilson", action: "found bug in", target: "Checkout Flow", time: "3 hours ago", type: "bug", icon: "🐛" },
  ];

  const meetings = [
    { title: "Daily Standup", time: "9:30 AM", attendees: 8, room: "Zoom 1" },
    { title: "Sprint Planning", time: "11:00 AM", attendees: 6, room: "Conf Room A" },
    { title: "Design Review", time: "2:00 PM", attendees: 5, room: "Figma" },
    { title: "Client Call", time: "4:30 PM", attendees: 4, room: "Google Meet" },
  ];

  const attendanceData = [
    { day: "Mon", present: 22, absent: 2 },
    { day: "Tue", present: 23, absent: 1 },
    { day: "Wed", present: 24, absent: 0 },
    { day: "Thu", present: 21, absent: 3 },
    { day: "Fri", present: 20, absent: 4 },
  ];

  const skillDistribution = [
    { skill: "Frontend", pct: 35, color: "#3b82f6" },
    { skill: "Backend", pct: 25, color: "#10b981" },
    { skill: "DevOps", pct: 15, color: "#f59e0b" },
    { skill: "Design", pct: 15, color: "#8b5cf6" },
    { skill: "QA", pct: 10, color: "#ef4444" },
  ];

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
        @keyframes sparkle{0%,100%{opacity:.5}50%{opacity:.9}}
        .spark{animation:sparkle 3s ease-in-out infinite;}
        select:focus{outline:2px solid #3b82f6;outline-offset:1px;}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"sticky", top:0, zIndex:100, height:64, background: scrolled?"rgba(255,255,255,.97)":"rgba(255,255,255,.82)", backdropFilter:"blur(20px) saturate(180%)", WebkitBackdropFilter:"blur(20px) saturate(180%)", borderBottom:"1px solid rgba(232,236,240,.7)", boxShadow: scrolled?"0 1px 0 rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)":"none", transition:"all .3s ease", fontFamily:ff }}>
        <div style={{ maxWidth:1440, margin:"0 auto", height:"100%", ...between(), padding:"0 28px", gap:32 }}>
          <div style={row(10)}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8" fill="#8b5cf6"/>
              <path d="M8 15h14M15 8l7 7-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize:18, fontWeight:800, color:"#0f172a", letterSpacing:"-.5px" }}>TeamFlow</span>
          </div>
          <div style={row(12)}>
            <select value={dateRange} onChange={e=>setDateRange(e.target.value)}
              style={{ padding:"7px 28px 7px 12px", fontFamily:ff, fontSize:13, fontWeight:500, color:"#0f172a", background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer", outline:"none", appearance:"none" }}>
              {["Today","This Week","This Month","This Quarter"].map(o=><option key={o}>{o}</option>)}
            </select>
            <div style={{ width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#c084fc)",color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(139,92,246,.35)",userSelect:"none" }}>JD</div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1440, margin:"0 auto", padding:"28px 28px 56px", ...col(22) }}>

        {/* ── HERO ── */}
        <Reveal>
          <div style={{ position:"relative", background:"linear-gradient(135deg,#312e81 0%,#5b21b6 55%,#8b5cf6 100%)", borderRadius:20, padding:"44px 48px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:160, boxShadow:"0 12px 40px rgba(0,0,0,.18)" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", right:-80, top:-80, width:320, height:320, background:"radial-gradient(circle,rgba(139,92,246,.25) 0%,transparent 65%)", pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"rgba(139,92,246,.2)", border:"1px solid rgba(139,92,246,.3)", color:"#c084fc", fontSize:11.5, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase", marginBottom:12, animation:"pulseDot 2.4s ease-in-out infinite" }}>
                ● Team Manager
              </div>
              <h1 style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-1px", lineHeight:1.12 }}>
                Good to see you,<br/>
                <span style={{ background:"linear-gradient(90deg,#c084fc,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Team Lead</span>
              </h1>
              <p style={{ marginTop:8, fontSize:14, color:"rgba(255,255,255,.5)" }}>Your team's progress and tasks at a glance.</p>
            </div>
          </div>
        </Reveal>

        {/* ── TEAM STATS CARDS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {teamStats.map((s,i)=>(
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
              </Card>
            </Reveal>
          ))}
        </div>

        {/* ── TEAM PERFORMANCE + SKILLS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr", gap:20 }}>
          <Reveal>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Team Performance</p>
              <div style={col(8)}>
                {teamMembers.slice(0, 4).map((member, i) => (
                  <TeamMember key={i} {...member} />
                ))}
              </div>
              <button style={{ width:"100%", marginTop:16, padding:"10px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, fontSize:13, fontWeight:600, color:"#3b82f6", cursor:"pointer" }}>
                View All Team Members
              </button>
            </Card>
          </Reveal>
          
          <Reveal delay={60}>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Skill Distribution</p>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                <Donut segs={skillDistribution.map(s => ({ pct: s.pct, color: s.color }))} size={140} stroke={22} />
              </div>
              <div style={col(10)}>
                {skillDistribution.map((skill, i) => (
                  <div key={i} style={col(4)}>
                    <div style={{ ...row(8), fontSize:12.5 }}>
                      <span style={{ width:10,height:10,borderRadius:3,background:skill.color,flexShrink:0 }}/>
                      <span style={{ flex:1, color:"#475569" }}>{skill.skill}</span>
                      <span style={{ fontWeight:700, color:"#0f172a" }}>{skill.pct}%</span>
                    </div>
                    <ABar pct={skill.pct} color={skill.color} delay={200+i*80}/>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── PROJECTS + TASKS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 2.2fr", gap:20 }}>
          <Reveal delay={80}>
            <Card>
              <div style={{ ...between(), marginBottom:16 }}>
                <p style={h3}>Active Projects</p>
                <button style={{ padding:"5px 12px", fontSize:12, fontWeight:600, color:"#3b82f6", background:"#eff6ff", border:"none", borderRadius:6, cursor:"pointer" }}>New Project</button>
              </div>
              <div style={col(16)}>
                {projects.map((project, i) => (
                  <div key={i} style={col(6)}>
                    <div style={between()}>
                      <div style={row(8)}>
                        <span style={{ width:10,height:10,borderRadius:3,background:project.color,flexShrink:0 }}/>
                        <span style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>{project.name}</span>
                      </div>
                      <span style={{ fontSize:12, color:"#64748b" }}>{project.team} members</span>
                    </div>
                    <div style={between()}>
                      <span style={{ fontSize:12, color:"#94a3b8" }}>Progress {project.progress}%</span>
                      <span style={{ fontSize:12, color:"#ef4444" }}>Due {project.deadline}</span>
                    </div>
                    <ABar pct={project.progress} color={project.color} delay={300+i*80}/>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card>
              <div style={{ ...between(), marginBottom:16 }}>
                <p style={h3}>Today's Tasks</p>
                <button style={{ padding:"5px 12px", fontSize:12, fontWeight:600, color:"#10b981", background:"#ecfdf5", border:"none", borderRadius:6, cursor:"pointer" }}>Add Task</button>
              </div>
              <div style={{ maxHeight:360, overflowY:"auto" }}>
                {tasks.map((task, i) => (
                  <TaskItem key={i} {...task} />
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1.5fr 1.3fr", gap:20 }}>
          {/* Attendance */}
          <Reveal delay={160}>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Weekly Attendance</p>
              <div style={col(12)}>
                {attendanceData.map((day, i) => (
                  <div key={i} style={col(4)}>
                    <div style={between()}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{day.day}</span>
                      <span style={{ fontSize:12, color:"#10b981" }}>{day.present} present</span>
                    </div>
                    <div style={row(0)}>
                      <div style={{ flex: day.present, height:8, background:"#10b981", borderRadius:4 }} />
                      <div style={{ flex: day.absent, height:8, background:"#fee2e2", borderRadius:4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Upcoming Meetings */}
          <Reveal delay={200}>
            <Card>
              <p style={{ ...h3, marginBottom:16 }}>Upcoming Meetings</p>
              <div style={col(12)}>
                {meetings.map((meeting, i) => (
                  <div key={i} style={{ padding:"12px", background:"#f8fafc", borderRadius:10 }}>
                    <div style={between()}>
                      <span style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>{meeting.title}</span>
                      <span style={{ fontSize:12, padding:"3px 8px", background:"#3b82f6", color:"#fff", borderRadius:12 }}>{meeting.time}</span>
                    </div>
                    <div style={{ marginTop:6, ...row(12) }}>
                      <span style={{ fontSize:12, color:"#64748b" }}>👥 {meeting.attendees} attendees</span>
                      <span style={{ fontSize:12, color:"#64748b" }}>📍 {meeting.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Recent Activity */}
          <Reveal delay={240}>
            <Card p={0}>
              <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid #f1f5f9" }}>
                <p style={h3}>Team Activity</p>
              </div>
              <div style={{ padding:8 }}>
                {activity.map((a,i)=>(
                  <div key={i} className="ai" style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, cursor:"default" }}>
                    <div style={{ width:32,height:32,borderRadius:10,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, color:"#475569", lineHeight:1.5 }}>
                        <strong style={{ color:"#0f172a", fontWeight:600 }}>{a.user} </strong>
                        {a.action} <strong>{a.target}</strong>
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

/* ─── Card Component ────────────────────────────────────────── */
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

/* ─── Reveal wrapper ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}