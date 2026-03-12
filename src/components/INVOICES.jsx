// Invoices.jsx — CargoFlow · Navy #001F3F · Accent #FFAB00
// Single-file: CSS inlined via <style> tag
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --navy:        #001F3F;
  --navy-mid:    #002d5a;
  --navy-light:  #003f80;
  --orange:      #FFAB00;
  --orange-dark: #e09700;
  --orange-pale: #fff4d6;
  --bg:          #F5F5F5;
  --bg-2:        #EBEBEB;
  --surface:     #ffffff;
  --text-1:      #212121;
  --text-2:      #424242;
  --text-3:      #757575;
  --text-4:      #BDBDBD;
  --green:       #0fa869;
  --green-pale:  #e6f9f1;
  --red:         #e5434b;
  --red-pale:    #fdedef;
  --border:      rgba(0,31,63,0.09);
  --border-2:    rgba(0,31,63,0.18);
  --shadow-sm:   0 1px 4px rgba(0,31,63,0.06), 0 2px 12px rgba(0,31,63,0.04);
  --shadow-md:   0 4px 20px rgba(0,31,63,0.09), 0 1px 4px rgba(0,31,63,0.05);
  --shadow-lg:   0 12px 48px rgba(0,31,63,0.13), 0 4px 16px rgba(0,31,63,0.06);
  --shadow-navy: 0 8px 32px rgba(0,31,63,0.25);
  --r-sm:  8px;
  --r-md:  12px;
  --r-lg:  16px;
  --r-xl:  22px;
  --r-2xl: 28px;
  --ease:   cubic-bezier(0.4,0,0.2,1);
  --spring: cubic-bezier(0.34,1.56,0.64,1);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text-1);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,31,63,0.2); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,31,63,0.35); }

/* ── KEYFRAMES ── */
@keyframes fadeUp { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
@keyframes slideInRight { from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);} }
@keyframes rowIn { from{opacity:0;transform:translateX(-10px);}to{opacity:1;transform:translateX(0);} }
@keyframes toastIn  { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }
@keyframes toastOut { from{opacity:1;}to{opacity:0;transform:translateX(30px);} }
@keyframes shipSail {
  0%{transform:translateX(-160px) translateY(0);opacity:0;}
  5%{opacity:0.18;}90%{opacity:0.18;}
  100%{transform:translateX(calc(100vw + 160px)) translateY(-18px);opacity:0;}
}
@keyframes shipSail2 {
  0%{transform:translateX(-200px);opacity:0;}
  5%{opacity:0.10;}90%{opacity:0.10;}
  100%{transform:translateX(calc(100vw + 200px)) translateY(12px);opacity:0;}
}
@keyframes cloudDrift {
  0%{transform:translateX(-120px);opacity:0;}
  8%{opacity:0.12;}92%{opacity:0.12;}
  100%{transform:translateX(calc(100vw + 120px));opacity:0;}
}
@keyframes floatOrb {
  0%,100%{transform:translateY(0) scale(1);}
  33%{transform:translateY(-22px) scale(1.04);}
  66%{transform:translateY(10px) scale(0.97);}
}
@keyframes floatOrbB {
  0%,100%{transform:translateY(0) scale(1);}
  50%{transform:translateY(-30px) scale(1.06);}
}
@keyframes rotateSlow { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes rotateSlowR { from{transform:rotate(0deg);}to{transform:rotate(-360deg);} }
@keyframes pulseDot {
  0%,100%{transform:scale(1);opacity:0.6;}
  50%{transform:scale(1.8);opacity:0.2;}
}
@keyframes containerBounce {
  0%,100%{transform:translateY(0);}
  50%{transform:translateY(-6px);}
}
@keyframes particleFly {
  0%{transform:translateY(0) translateX(0) scale(1);opacity:0.7;}
  100%{transform:translateY(-80px) translateX(30px) scale(0);opacity:0;}
}
@keyframes particleFly2 {
  0%{transform:translateY(0) translateX(0) scale(1);opacity:0.5;}
  100%{transform:translateY(-60px) translateX(-40px) scale(0);opacity:0;}
}
@keyframes waveMove { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }
@keyframes gridPulse { 0%,100%{opacity:0.03;}50%{opacity:0.07;} }
@keyframes glowPulse {
  0%,100%{opacity:0.12;transform:scale(1);}
  50%{opacity:0.22;transform:scale(1.08);}
}
@keyframes revealUp { from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);} }
@keyframes revealLeft { from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);} }
@keyframes revealScale { from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);} }
@keyframes countUp { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }

/* ── BACKGROUND SCENE ── */
.inv-bg {
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none; overflow: hidden;
}

/* ── SHIP PHOTO BACKGROUND ── */
.bg-photo {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80&auto=format&fit=crop');
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  opacity: 0.09;
  filter: saturate(0.6) brightness(0.9);
}
/* tinted overlay so it blends into the light page */
.bg-photo::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    180deg,
    rgba(245,245,245,0.55) 0%,
    rgba(245,245,245,0.30) 40%,
    rgba(245,245,245,0.55) 100%
  );
}

.inv-bg::before {
  content: ''; position: absolute;
  inset: -100%;
  width: 300%; height: 300%;
  background-image: radial-gradient(circle, rgba(0,31,63,0.12) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: rotateSlow 40s linear infinite;
  transform-origin: center center;
}
.inv-bg::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 10% 20%, rgba(0,31,63,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 90% 80%, rgba(255,171,0,0.05) 0%, transparent 70%),
    radial-gradient(ellipse 40% 60% at 50% 50%, rgba(0,63,128,0.03) 0%, transparent 80%);
}
.bg-orb { position:absolute; border-radius:50%; pointer-events:none; }
.bg-orb-1 {
  width:90px; height:90px;
  background: radial-gradient(circle at 35% 35%, rgba(0,50,100,0.7), #001F3F);
  box-shadow: 0 8px 32px rgba(0,31,63,0.35);
  filter: blur(2px);
  top: 50%; left: 50%;
  transform-origin: -220px -180px;
  animation: orbitCW1 18s linear infinite;
}
.bg-orb-2 {
  width:60px; height:60px;
  background: radial-gradient(circle at 35% 35%, rgba(0,60,120,0.65), #001F3F);
  box-shadow: 0 6px 22px rgba(0,31,63,0.3);
  filter: blur(1.5px);
  top: 50%; left: 50%;
  transform-origin: 280px 140px;
  animation: orbitCW2 24s linear infinite;
}
.bg-orb-3 {
  width:44px; height:44px;
  background: radial-gradient(circle at 35% 35%, rgba(0,45,90,0.6), #001F3F);
  box-shadow: 0 4px 16px rgba(0,31,63,0.28);
  filter: blur(1px);
  top: 50%; left: 50%;
  transform-origin: -160px 260px;
  animation: orbitCW3 30s linear infinite;
}
@keyframes orbitCW1 { from{transform:rotate(0deg);}   to{transform:rotate(360deg);}  }
@keyframes orbitCW2 { from{transform:rotate(0deg);}   to{transform:rotate(360deg);}  }
@keyframes orbitCW3 { from{transform:rotate(0deg);}   to{transform:rotate(360deg);}  }
.bg-wave { position:absolute; bottom:0; left:0; width:200%; height:80px; opacity:0.05; animation:waveMove 22s linear infinite; }
.bg-ship  { position:absolute; bottom:18%; left:0; opacity:0; animation:shipSail  28s linear infinite 3s; }
.bg-ship-2{ position:absolute; bottom:24%; left:0; opacity:0; animation:shipSail2 38s linear infinite 14s; }
.bg-cloud  { position:absolute; opacity:0; animation:cloudDrift 40s linear infinite 8s; }
.bg-cloud-2{ position:absolute; opacity:0; animation:cloudDrift 55s linear infinite 22s; }
.bg-ring { position:absolute; border-radius:50%; border:1px solid rgba(0,31,63,0.07); pointer-events:none; }
.bg-ring-1 {
  width:300px; height:300px; top:60px; right:5%;
  animation: rotateSlow 40s linear infinite;
}
.bg-ring-1::after {
  content:''; position:absolute; top:20px; left:50%; width:8px; height:8px;
  background:rgba(255,171,0,0.5); border-radius:50%; transform:translateX(-50%);
  box-shadow:0 0 8px rgba(255,171,0,0.4);
  animation: pulseDot 2s ease-in-out infinite;
}
.bg-ring-2 { width:180px; height:180px; top:100px; right:calc(5% + 60px); border-color:rgba(255,171,0,0.06); animation:rotateSlowR 28s linear infinite; }
.bg-ring-3 { width:500px; height:500px; bottom:-100px; left:-60px; border-color:rgba(0,31,63,0.04); animation:rotateSlow 60s linear infinite; }
.bg-box { position:absolute; border-radius:6px; background:rgba(0,31,63,0.06); border:1px solid rgba(0,31,63,0.08); animation:containerBounce 4s ease-in-out infinite; pointer-events:none; }
.bg-box-1 { width:40px; height:24px; top:22%; right:12%; animation-delay:0s; }
.bg-box-2 { width:28px; height:18px; top:30%; right:9%;  animation-delay:0.8s; }
.bg-box-3 { width:48px; height:28px; top:26%; right:15%; animation-delay:1.5s; }
.bg-particle { position:absolute; border-radius:50%; background:rgba(255,171,0,0.5); pointer-events:none; }
.bg-p1 { width:5px; height:5px; bottom:30%; left:15%; animation:particleFly  7s ease-in infinite 1s; }
.bg-p2 { width:4px; height:4px; bottom:40%; left:25%; animation:particleFly2 9s ease-in infinite 3s; }
.bg-p3 { width:3px; height:3px; bottom:25%; left:60%; animation:particleFly  11s ease-in infinite 5s; }
.bg-p4 { width:6px; height:6px; bottom:50%; left:80%; animation:particleFly2 8s ease-in infinite 2s; background:rgba(0,31,63,0.3); }
.bg-p5 { width:4px; height:4px; bottom:35%; left:45%; animation:particleFly  13s ease-in infinite 6s; }

/* ── HERO BANNER ── */
.inv-hero {
  position: relative;
  background: linear-gradient(135deg, #001F3F 0%, #002d5a 50%, #001a35 100%);
  border-radius: var(--r-2xl); padding: 40px 40px 36px;
  margin-bottom: 28px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,31,63,0.25), 0 4px 20px rgba(0,31,63,0.15);
  animation: revealUp 0.6s var(--ease) both;
}
.inv-hero::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 24px 24px; pointer-events: none;
}
.inv-hero::after {
  content: ''; position: absolute; top: -60px; right: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,171,0,0.15) 0%, transparent 70%);
  pointer-events: none; animation: glowPulse 4s ease-in-out infinite;
}
.hero-glow-bottom {
  position: absolute; bottom: -40px; left: 20%; width: 200px; height: 200px;
  border-radius: 50%; background: radial-gradient(circle, rgba(0,100,200,0.18) 0%, transparent 70%);
  pointer-events: none; animation: glowPulse 6s ease-in-out infinite 2s;
}
.hero-inner {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,171,0,0.15); border: 1px solid rgba(255,171,0,0.3);
  border-radius: 20px; padding: 4px 12px;
  font-size: 11px; font-weight: 700; color: #FFAB00;
  text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;
  animation: revealLeft 0.6s var(--ease) 0.1s both;
}
.hero-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#FFAB00; animation:pulseDot 2s ease-in-out infinite; }
.hero-title {
  font-size: 34px; font-weight: 800; color: #fff;
  letter-spacing: -0.9px; line-height: 1.1; margin-bottom: 10px;
  animation: revealLeft 0.6s var(--ease) 0.18s both;
}
.hero-title span { color: #FFAB00; }
.hero-sub { font-size: 14px; color: rgba(255,255,255,0.6); max-width:420px; line-height:1.6; animation:revealLeft 0.6s var(--ease) 0.26s both; }
.hero-stats { display:flex; gap:28px; margin-top:22px; animation:revealLeft 0.6s var(--ease) 0.34s both; }
.hero-stat { display:flex; flex-direction:column; gap:2px; }
.hero-stat-val { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px; animation:countUp 0.6s var(--ease) 0.5s both; }
.hero-stat-val.accent { color:#FFAB00; }
.hero-stat-label { font-size:11px; color:rgba(255,255,255,0.5); font-weight:500; text-transform:uppercase; letter-spacing:0.7px; }
.hero-stat-divider { width:1px; background:rgba(255,255,255,0.1); align-self:stretch; margin:4px 0; }
.hero-right { position:relative; flex-shrink:0; animation:revealScale 0.7s var(--spring) 0.3s both; }
.hero-ship-wrap { position:relative; width:200px; height:140px; }
.hero-ship-svg { width:100%; height:100%; filter:drop-shadow(0 8px 24px rgba(0,0,0,0.4)); }
.hero-ship-glow {
  position:absolute; bottom:-10px; left:50%; transform:translateX(-50%);
  width:160px; height:30px; border-radius:50%;
  background:rgba(255,171,0,0.2); filter:blur(14px);
  animation:glowPulse 3s ease-in-out infinite;
}
.hero-orbit { position:absolute; border-radius:50%; border:1px dashed rgba(255,255,255,0.12); top:50%; left:50%; transform:translate(-50%,-50%); }
.hero-orbit-1 { width:170px; height:170px; animation:rotateSlow 20s linear infinite; }
.hero-orbit-2 { width:220px; height:220px; animation:rotateSlowR 30s linear infinite; }
.hero-orbit-dot { position:absolute; width:8px; height:8px; border-radius:50%; background:#FFAB00; top:-4px; left:50%; transform:translateX(-50%); box-shadow:0 0 10px rgba(255,171,0,0.7); }
.hero-badge {
  position:absolute; top:-12px; right:-12px;
  background: linear-gradient(135deg,#FFAB00,#ffc940);
  color:#001F3F; font-size:11px; font-weight:800;
  padding:6px 12px; border-radius:20px;
  box-shadow:0 4px 16px rgba(255,171,0,0.4);
  animation:containerBounce 3s ease-in-out infinite; white-space:nowrap;
}
.hero-actions { display:flex; gap:10px; margin-top:20px; animation:revealLeft 0.6s var(--ease) 0.4s both; }
.hero-btn-primary {
  height:42px; padding:0 22px;
  background: linear-gradient(135deg,#FFAB00,#ffc940);
  color:#001F3F; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:800;
  border:none; border-radius:var(--r-lg); cursor:pointer;
  display:flex; align-items:center; gap:7px;
  box-shadow:0 6px 20px rgba(255,171,0,0.4); transition:all 0.25s var(--ease);
}
.hero-btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(255,171,0,0.5); }
.hero-btn-secondary {
  height:42px; padding:0 20px;
  background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
  color:#fff; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600;
  border-radius:var(--r-lg); cursor:pointer; display:flex; align-items:center; gap:7px;
  transition:all 0.25s var(--ease);
}
.hero-btn-secondary:hover { background:rgba(255,255,255,0.18); transform:translateY(-2px); }

/* ── SCROLL REVEAL ── */
.reveal { opacity:0; transform:translateY(28px); transition:opacity 0.65s var(--ease),transform 0.65s var(--ease); }
.reveal.visible { opacity:1; transform:translateY(0); }
.reveal-left { opacity:0; transform:translateX(-24px); transition:opacity 0.6s var(--ease),transform 0.6s var(--ease); }
.reveal-left.visible { opacity:1; transform:translateX(0); }
.reveal-scale { opacity:0; transform:scale(0.94); transition:opacity 0.55s var(--ease),transform 0.55s var(--spring); }
.reveal-scale.visible { opacity:1; transform:scale(1); }
.delay-1 { transition-delay:0.08s !important; }
.delay-2 { transition-delay:0.16s !important; }
.delay-3 { transition-delay:0.24s !important; }
.delay-4 { transition-delay:0.32s !important; }

/* shimmer sweep on stat cards */
.inv-stat-card::after {
  content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);
  transition:left 0.5s var(--ease);
}
.inv-stat-card:hover::after { left:150%; }

/* page body stacks above bg */
.inv-page { position:relative; z-index:1; }

/* ── PAGE SHELL ── */
.inv-page { min-height: 100vh; display: flex; flex-direction: column; }
.inv-body {
  flex: 1; max-width: 1280px; margin: 0 auto;
  width: 100%; padding: 32px 24px 48px;
}

/* ── PAGE HEADER ── */
.inv-page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 28px; animation: fadeUp 0.5s var(--ease) both;
}
.inv-page-header-left { display: flex; flex-direction: column; gap: 4px; }
.inv-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 1.2px;
  text-transform: uppercase; color: var(--orange); margin-bottom: 2px;
}
.inv-page-header h1 {
  font-size: 28px; font-weight: 800; color: var(--navy); letter-spacing: -0.7px; line-height: 1;
}
.inv-page-header p { font-size: 13.5px; color: var(--text-3); margin-top: 4px; }
.inv-header-actions { display: flex; gap: 10px; align-items: center; }

.btn-primary {
  height: 40px; padding: 0 20px;
  background: linear-gradient(135deg, var(--navy-mid), var(--navy));
  color: #fff; font-family: 'Inter', sans-serif;
  font-size: 13.5px; font-weight: 700; border: none;
  border-radius: var(--r-lg); cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  box-shadow: var(--shadow-navy); transition: all 0.25s var(--ease);
  position: relative; overflow: hidden;
}
.btn-primary::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
  opacity: 0; transition: opacity 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,31,63,0.35); }
.btn-primary:hover::after { opacity: 1; }

.btn-secondary {
  height: 40px; padding: 0 18px;
  background: var(--surface); border: 1.5px solid var(--border-2);
  color: var(--text-2); font-family: 'Inter', sans-serif;
  font-size: 13.5px; font-weight: 600; border-radius: var(--r-lg);
  cursor: pointer; display: flex; align-items: center; gap: 7px;
  transition: all 0.2s var(--ease); box-shadow: var(--shadow-sm);
}
.btn-secondary:hover { background: var(--orange-pale); border-color: rgba(255,171,0,0.4); color: var(--navy); transform: translateY(-1px); }

/* ── STATS STRIP ── */
.inv-stats-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.inv-stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 20px 22px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow-sm); transition: all 0.3s var(--ease);
  position: relative; overflow: hidden; animation: fadeUp 0.5s var(--ease) both; cursor: default;
}
.inv-stat-card::before {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--card-accent, var(--navy));
  transform: scaleX(0); transform-origin: left; transition: transform 0.4s var(--ease);
}
.inv-stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.inv-stat-card:hover::before { transform: scaleX(1); }
.inv-stat-card:nth-child(1) { --card-accent: linear-gradient(90deg,#001F3F,#003f80); animation-delay:.04s; }
.inv-stat-card:nth-child(2) { --card-accent: linear-gradient(90deg,#FFAB00,#ffc940); animation-delay:.08s; }
.inv-stat-card:nth-child(3) { --card-accent: linear-gradient(90deg,#0fa869,#34d399); animation-delay:.12s; }
.inv-stat-card:nth-child(4) { --card-accent: linear-gradient(90deg,#e5434b,#f87171); animation-delay:.16s; }
.stat-icon {
  width: 46px; height: 46px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0; transition: transform 0.3s var(--spring);
}
.inv-stat-card:hover .stat-icon { transform: scale(1.12) rotate(-6deg); }
.si-navy   { background: linear-gradient(135deg,#dce5ef,#c6d5e8); }
.si-orange { background: linear-gradient(135deg,#fff0c2,#ffe08a); }
.si-green  { background: linear-gradient(135deg,#dcf7ed,#c5f0de); }
.si-red    { background: linear-gradient(135deg,#fde8ea,#fbc8cc); }
.stat-info { flex: 1; min-width: 0; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.7px; }
.stat-value { font-size: 24px; font-weight: 800; color: var(--navy); letter-spacing: -0.7px; margin-top: 3px; line-height: 1; }
.stat-sub   { font-size: 12px; color: var(--text-3); margin-top: 4px; }
.stat-pill  { display: inline-flex; align-items: center; gap: 3px; margin-top: 5px; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.pill-up   { background: var(--green-pale); color: var(--green); }
.pill-down { background: var(--red-pale);   color: var(--red); }
.pill-neu  { background: var(--orange-pale); color: var(--orange-dark); }

/* ── FILTER BAR ── */
.inv-filter-bar {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 18px 20px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin-bottom: 20px; box-shadow: var(--shadow-sm);
  animation: fadeUp 0.5s var(--ease) 0.15s both;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
.filter-label { font-size: 10.5px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.7px; }
.filter-input, .filter-select {
  height: 38px; background: var(--bg); border: 1.5px solid var(--border);
  border-radius: var(--r-md); padding: 0 12px;
  color: var(--text-1); font-family: 'Inter', sans-serif; font-size: 13px;
  outline: none; transition: all 0.22s var(--ease); width: 100%;
}
.filter-input::placeholder { color: var(--text-4); }
.filter-input:focus, .filter-select:focus {
  border-color: var(--navy); background: #fff; box-shadow: 0 0 0 3px rgba(0,31,63,0.1);
}
.filter-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
.filter-select-wrap { position: relative; }
.filter-select-wrap::after {
  content: ''; position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
  width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 5px solid var(--text-3); pointer-events: none;
}
.filter-divider { width: 1px; height: 40px; background: var(--border); flex-shrink: 0; }
.filter-action-group { display: flex; gap: 8px; align-items: flex-end; }
.btn-filter {
  height: 38px; padding: 0 16px;
  background: linear-gradient(135deg, var(--navy-mid), var(--navy));
  color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
  border: none; border-radius: var(--r-md); cursor: pointer;
  transition: all 0.2s var(--ease); display: flex; align-items: center; gap: 5px;
}
.btn-filter:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,31,63,0.25); }
.btn-reset {
  height: 38px; padding: 0 14px; background: transparent;
  border: 1.5px solid var(--border-2); color: var(--text-3);
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
  border-radius: var(--r-md); cursor: pointer; transition: all 0.2s var(--ease);
}
.btn-reset:hover { background: var(--bg-2); color: var(--text-1); }

/* ── STATUS TABS ── */
.inv-tabs { display: flex; gap: 6px; margin-bottom: 16px; animation: fadeUp 0.5s var(--ease) 0.2s both; }
.inv-tab {
  height: 34px; padding: 0 16px; border-radius: 20px;
  border: 1.5px solid var(--border); background: var(--surface); color: var(--text-2);
  font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: all 0.2s var(--ease); display: flex; align-items: center; gap: 6px;
  font-family: 'Inter', sans-serif;
}
.inv-tab:hover { border-color: var(--navy); color: var(--navy); background: #e6edf5; }
.inv-tab.active { background: var(--navy); border-color: var(--navy); color: #fff; box-shadow: 0 4px 14px rgba(0,31,63,0.25); }
.tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 800;
}
.inv-tab.active .tab-count { background: rgba(255,255,255,0.25); }
.inv-tab:not(.active) .tab-count { background: var(--bg-2); color: var(--text-3); }

/* ── MAIN SPLIT ── */
.inv-main { display: grid; grid-template-columns: 1fr 480px; gap: 20px; align-items: start; animation: fadeUp 0.5s var(--ease) 0.25s both; }
.inv-main.detail-hidden { grid-template-columns: 1fr; }

/* ── TABLE CARD ── */
.inv-table-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-2xl); overflow: hidden; box-shadow: var(--shadow-md);
}
.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; border-bottom: 1px solid var(--border); background: #fafcff;
}
.table-toolbar-left { display: flex; align-items: center; gap: 10px; }
.table-title { font-size: 14px; font-weight: 700; color: var(--navy); }
.table-count-badge {
  background: var(--orange-pale); color: var(--orange-dark);
  border: 1px solid rgba(255,171,0,0.3); border-radius: 20px;
  padding: 2px 10px; font-size: 12px; font-weight: 700;
}
.table-toolbar-right { display: flex; gap: 7px; }
.toolbar-btn {
  height: 30px; padding: 0 12px; background: var(--surface);
  border: 1.5px solid var(--border); border-radius: var(--r-sm); color: var(--text-2);
  font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;
  cursor: pointer; transition: all 0.2s var(--ease); display: flex; align-items: center; gap: 5px;
}
.toolbar-btn:hover { background: var(--orange-pale); border-color: rgba(255,171,0,0.4); color: var(--navy); transform: translateY(-1px); }

table.inv-table { width: 100%; border-collapse: collapse; }
table.inv-table thead tr { background: linear-gradient(90deg, #f4f8ff, #f9faff); }
table.inv-table thead th {
  padding: 11px 18px; text-align: left; font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-3);
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
table.inv-table thead th:first-child { padding-left: 22px; }
table.inv-table thead th:last-child  { padding-right: 22px; }
table.inv-table tbody tr {
  border-bottom: 1px solid rgba(0,31,63,0.05);
  transition: all 0.2s var(--ease); cursor: pointer;
}
table.inv-table tbody tr:last-child { border-bottom: none; }
table.inv-table tbody tr:hover { background: #f6f9ff; }
table.inv-table tbody tr.row-active { background: linear-gradient(90deg,#fff8e6,#fffbf0); border-left: 3px solid var(--orange); }
table.inv-table tbody tr.row-active td:first-child { padding-left: 19px; }
table.inv-table tbody td {
  padding: 13px 18px; font-size: 13px; color: var(--text-2); vertical-align: middle;
}
table.inv-table tbody td:first-child { padding-left: 22px; font-weight: 700; color: var(--navy); font-size: 12.5px; }
table.inv-table tbody td:last-child  { padding-right: 22px; }
table.inv-table tbody tr:nth-child(1) { animation: rowIn .3s .04s both; }
table.inv-table tbody tr:nth-child(2) { animation: rowIn .3s .08s both; }
table.inv-table tbody tr:nth-child(3) { animation: rowIn .3s .12s both; }
table.inv-table tbody tr:nth-child(4) { animation: rowIn .3s .16s both; }
table.inv-table tbody tr:nth-child(5) { animation: rowIn .3s .20s both; }
table.inv-table tbody tr:nth-child(6) { animation: rowIn .3s .24s both; }
table.inv-table tbody tr:nth-child(7) { animation: rowIn .3s .28s both; }

.inv-id-cell { display: flex; align-items: center; gap: 8px; }
.inv-id-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.amount-val  { font-weight: 700; color: var(--navy); font-size: 13.5px; }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.b-paid    { background: var(--green-pale); color: var(--green);     border: 1px solid rgba(15,168,105,0.2); }
.b-unpaid  { background: var(--red-pale);   color: var(--red);       border: 1px solid rgba(229,67,75,0.2); }
.b-pending { background: var(--orange-pale);color: var(--orange-dark);border: 1px solid rgba(255,171,0,0.25); }
.b-overdue { background: #fff0f0;           color: #c0392b;          border: 1px solid rgba(192,57,43,0.2); }
.b-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.btn-view {
  height: 28px; padding: 0 12px; background: var(--orange-pale);
  border: 1.5px solid rgba(255,171,0,0.35); color: var(--navy);
  font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
  border-radius: var(--r-sm); cursor: pointer; transition: all 0.2s var(--ease);
  display: inline-flex; align-items: center; gap: 4px;
}
.btn-view:hover { background: var(--orange); border-color: var(--orange); color: #1a1a1a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,171,0,0.35); }
.btn-view.active { background: var(--orange); border-color: var(--orange); color: #1a1a1a; }

/* ── PAGINATION ── */
.inv-pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px; border-top: 1px solid var(--border); background: #fafcff;
}
.page-info { font-size: 12px; color: var(--text-3); }
.page-btns { display: flex; gap: 4px; }
.page-btn {
  width: 30px; height: 30px; border-radius: var(--r-sm);
  border: 1.5px solid var(--border); background: var(--surface); color: var(--text-2);
  font-size: 12px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s var(--ease); font-family: 'Inter', sans-serif;
}
.page-btn:hover { background: var(--orange-pale); border-color: rgba(255,171,0,0.4); color: var(--navy); }
.page-btn.active { background: var(--navy); border-color: var(--navy); color: #fff; }

/* ── INVOICE DETAIL PANEL ── */
.inv-detail-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-2xl); box-shadow: var(--shadow-lg);
  overflow: hidden; position: sticky; top: 72px;
  animation: slideInRight 0.38s var(--spring) both;
}
.detail-header {
  background: linear-gradient(135deg, var(--navy), var(--navy-mid));
  padding: 22px 24px; display: flex; align-items: flex-start; justify-content: space-between;
}
.detail-inv-id    { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.5px; }
.detail-inv-title { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.4px; margin-top: 2px; }
.detail-status-wrap { margin-top: 8px; }
.detail-close {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s var(--ease); flex-shrink: 0;
}
.detail-close:hover { background: rgba(229,67,75,0.3); transform: rotate(90deg); }
.detail-action-bar {
  display: flex; gap: 8px; padding: 14px 24px;
  border-bottom: 1px solid var(--border); background: var(--surface);
}
.btn-pdf {
  flex: 1; height: 38px; border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--navy-mid), var(--navy));
  color: #fff; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all 0.22s var(--ease); box-shadow: 0 4px 14px rgba(0,31,63,0.25);
}
.btn-pdf:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,31,63,0.32); }
.btn-email {
  flex: 1; height: 38px; border-radius: var(--r-md);
  background: var(--orange-pale); border: 1.5px solid rgba(255,171,0,0.4);
  color: var(--navy); font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all 0.22s var(--ease);
}
.btn-email:hover { background: var(--orange); border-color: var(--orange); transform: translateY(-1px); }
.detail-body { padding: 20px 24px; overflow-y: auto; max-height: calc(100vh - 320px); }
.detail-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.party-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 14px 16px; }
.party-card-label { font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.party-name { font-size: 13.5px; font-weight: 800; color: var(--navy); }
.party-line { font-size: 12px; color: var(--text-3); margin-top: 3px; line-height: 1.5; }
.detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.meta-item { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); padding: 10px 14px; }
.meta-label { font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.8px; }
.meta-value { font-size: 13px; font-weight: 700; color: var(--navy); margin-top: 3px; }
.detail-items-label { font-size: 11px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.items-table thead tr { background: linear-gradient(90deg,#f4f8ff,#fafcff); }
.items-table thead th {
  padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-3);
  border-bottom: 1px solid var(--border);
}
.items-table tbody td {
  padding: 9px 10px; font-size: 12.5px; color: var(--text-2);
  border-bottom: 1px solid rgba(0,31,63,0.04); vertical-align: middle;
}
.items-table tbody tr:last-child td { border-bottom: none; }
.item-name  { font-weight: 600; color: var(--text-1); }
.item-total { font-weight: 700; color: var(--navy); text-align: right; }
.items-table thead th:last-child,
.items-table tbody td:last-child     { text-align: right; }
.items-table thead th:nth-child(2),
.items-table thead th:nth-child(3),
.items-table tbody td:nth-child(2),
.items-table tbody td:nth-child(3)   { text-align: center; }
.detail-totals {
  background: linear-gradient(135deg,#f4f8ff,#f9fbff);
  border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden;
}
.total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  font-size: 13px; color: var(--text-2);
}
.total-row:last-child { border-bottom: none; }
.total-row.grand { background: linear-gradient(135deg, var(--navy), var(--navy-mid)); color: #fff; font-size: 15px; }
.total-label { font-weight: 500; }
.total-label.grand-label { font-weight: 800; color: #fff; }
.total-val   { font-weight: 700; }
.total-val.grand-val { font-weight: 800; font-size: 16px; color: var(--orange); }

/* ── EMPTY STATE ── */
.inv-empty { text-align: center; padding: 60px 20px; }
.empty-icon  { font-size: 42px; margin-bottom: 12px; display: block; opacity: 0.3; }
.empty-title { font-size: 15px; font-weight: 700; color: var(--text-2); margin-bottom: 4px; }
.empty-sub   { font-size: 13px; color: var(--text-3); }

/* ── TOAST ── */
.toast-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: var(--surface); border-radius: var(--r-lg);
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  font-size: 13.5px; font-weight: 500; color: var(--text-1);
  box-shadow: var(--shadow-lg); min-width: 260px; max-width: 360px;
  border-left: 4px solid var(--navy); animation: toastIn 0.35s var(--spring) both;
}
.toast-wrap.out { animation: toastOut 0.3s var(--ease) both; }
.toast-icon  { width: 32px; height: 32px; border-radius: 9px; background: #e6edf5; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.toast-close { margin-left: auto; color: var(--text-4); cursor: pointer; font-size: 16px; transition: color 0.2s; }
.toast-close:hover { color: var(--text-2); }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .inv-main { grid-template-columns: 1fr; }
  .inv-detail-panel { position: static; }
}
@media (max-width: 800px) {
  .inv-stats-strip { grid-template-columns: repeat(2,1fr); }
  .detail-parties  { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .inv-body { padding: 20px 14px; }
  .inv-stats-strip { grid-template-columns: 1fr 1fr; }
  .inv-filter-bar  { flex-direction: column; }
}
`;

/* ═══════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════ */
const INVOICES = [
  {
    id: "INV-2025-001", shipmentId: "SHP-4821", customer: "Alpine Freight Co.",
    amount: 4850.00, issued: "2025-01-05", due: "2025-01-20", status: "Paid",
    customerEmail: "billing@alpinefreight.com", customerAddr: "12 Mountain Rd, Denver CO 80201",
    items: [
      { desc: "Standard Shipping (Denver → LA)", qty: 1, price: 3200.00 },
      { desc: "Customs Clearance Fee",           qty: 1, price:  850.00 },
      { desc: "Fuel Surcharge (5%)",             qty: 1, price:  800.00 },
    ], tax: 0.08,
  },
  {
    id: "INV-2025-002", shipmentId: "SHP-4822", customer: "Pacific Rim Logistics",
    amount: 12400.00, issued: "2025-01-08", due: "2025-01-23", status: "Unpaid",
    customerEmail: "accounts@pacificrim.io", customerAddr: "88 Harbor View, Seattle WA 98101",
    items: [
      { desc: "Express Ocean Freight", qty: 3, price: 3500.00 },
      { desc: "Port Handling Charges", qty: 1, price:  600.00 },
      { desc: "Insurance Premium",     qty: 1, price:  300.00 },
    ], tax: 0.08,
  },
  {
    id: "INV-2025-003", shipmentId: "SHP-4830", customer: "Heartland Distributors",
    amount: 2100.00, issued: "2025-01-12", due: "2025-01-27", status: "Paid",
    customerEmail: "finance@heartlanddist.com", customerAddr: "500 Grain Ave, Chicago IL 60601",
    items: [
      { desc: "Ground Freight (Chicago → NYC)", qty: 2, price: 950.00 },
      { desc: "Packing & Crating",              qty: 1, price: 200.00 },
    ], tax: 0.08,
  },
  {
    id: "INV-2025-004", shipmentId: "SHP-4835", customer: "NorthStar Imports",
    amount: 8750.00, issued: "2025-01-15", due: "2025-01-30", status: "Overdue",
    customerEmail: "ap@northstarimports.ca", customerAddr: "200 Bay St, Toronto ON M5J 2J1",
    items: [
      { desc: "Air Freight (Toronto → LA)", qty: 2, price: 3200.00 },
      { desc: "Border Clearance",           qty: 1, price: 1100.00 },
      { desc: "Hazmat Handling",            qty: 1, price: 1250.00 },
    ], tax: 0.08,
  },
  {
    id: "INV-2025-005", shipmentId: "SHP-4840", customer: "SunState Retailers",
    amount: 3320.00, issued: "2025-01-18", due: "2025-02-02", status: "Pending",
    customerEmail: "billing@sunstateretail.com", customerAddr: "99 Palm Dr, Miami FL 33101",
    items: [
      { desc: "LTL Freight (Miami → Dallas)", qty: 1, price: 2200.00 },
      { desc: "Residential Delivery Fee",     qty: 1, price:  450.00 },
      { desc: "Liftgate Service",             qty: 2, price:  335.00 },
    ], tax: 0.07,
  },
  {
    id: "INV-2025-006", shipmentId: "SHP-4845", customer: "MidWest Cold Chain",
    amount: 6100.00, issued: "2025-01-22", due: "2025-02-06", status: "Paid",
    customerEmail: "finance@mwcoldchain.com", customerAddr: "301 Freezer Blvd, Kansas City MO 64101",
    items: [
      { desc: "Refrigerated Freight",    qty: 4, price: 1200.00 },
      { desc: "Temperature Monitoring",  qty: 1, price:  500.00 },
    ], tax: 0.08,
  },
  {
    id: "INV-2025-007", shipmentId: "SHP-4850", customer: "Atlas Global Trade",
    amount: 15800.00, issued: "2025-01-25", due: "2025-02-09", status: "Unpaid",
    customerEmail: "ap@atlasglobaltrade.com", customerAddr: "44 Commerce St, New York NY 10001",
    items: [
      { desc: "Full Container Load (FCL)", qty: 1, price: 12000.00 },
      { desc: "Freight Insurance",         qty: 1, price:  2000.00 },
      { desc: "Documentation Fees",        qty: 1, price:  1800.00 },
    ], tax: 0.09,
  },
];

const COMPANY = {
  name:  "CargoFlow Inc.",
  addr:  "1 Logistics Plaza, Suite 800",
  city:  "San Francisco, CA 94105",
  email: "billing@cargoflow.io",
  phone: "+1 (415) 800-CARGO",
  taxId: "EIN: 87-4521963",
};

const STATUS_META = {
  Paid:    { cls: "b-paid",    dot: "#0fa869" },
  Unpaid:  { cls: "b-unpaid",  dot: "#e5434b" },
  Pending: { cls: "b-pending", dot: "#FFAB00" },
  Overdue: { cls: "b-overdue", dot: "#c0392b" },
};

const fmt     = n => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
const fmtDate = s => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ═══════════════════════════════════════════════
   SCROLL-REVEAL HOOK
═══════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════
   BACKGROUND SCENE
═══════════════════════════════════════════════ */
function BackgroundScene() {
  return (
    <div className="inv-bg" aria-hidden="true">
      {/* real ship-at-sea photo */}
      <div className="bg-photo" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* rotating decorative rings */}
      <div className="bg-ring bg-ring-1" />
      <div className="bg-ring bg-ring-2" />
      <div className="bg-ring bg-ring-3" />

      {/* floating container boxes */}
      <div className="bg-box bg-box-1" />
      <div className="bg-box bg-box-2" />
      <div className="bg-box bg-box-3" />

      {/* particles */}
      <div className="bg-particle bg-p1" />
      <div className="bg-particle bg-p2" />
      <div className="bg-particle bg-p3" />
      <div className="bg-particle bg-p4" />
      <div className="bg-particle bg-p5" />

      {/* animated cargo ship (SVG) */}
      <div className="bg-ship">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="30" width="100" height="16" rx="4" fill="rgba(0,31,63,0.5)"/>
          <rect x="20" y="22" width="24" height="10" rx="2" fill="rgba(0,31,63,0.4)"/>
          <rect x="50" y="18" width="20" height="14" rx="2" fill="rgba(0,31,63,0.35)"/>
          <rect x="76" y="24" width="16" height="8" rx="2" fill="rgba(0,31,63,0.4)"/>
          <path d="M10 46 Q60 52 110 46" stroke="rgba(0,63,128,0.3)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="bg-ship-2">
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="20" width="68" height="12" rx="3" fill="rgba(0,31,63,0.3)"/>
          <rect x="14" y="14" width="16" height="8" rx="2" fill="rgba(0,31,63,0.25)"/>
          <rect x="34" y="12" width="14" height="10" rx="2" fill="rgba(0,31,63,0.22)"/>
        </svg>
      </div>

      {/* clouds */}
      <div className="bg-cloud" style={{ top: "8%" }}>
        <svg width="140" height="50" viewBox="0 0 140 50" fill="none">
          <ellipse cx="70" cy="35" rx="60" ry="18" fill="rgba(0,31,63,0.07)"/>
          <ellipse cx="50" cy="28" rx="30" ry="16" fill="rgba(0,31,63,0.07)"/>
          <ellipse cx="90" cy="25" rx="25" ry="14" fill="rgba(0,31,63,0.07)"/>
        </svg>
      </div>
      <div className="bg-cloud-2" style={{ top: "15%" }}>
        <svg width="100" height="36" viewBox="0 0 100 36" fill="none">
          <ellipse cx="50" cy="26" rx="42" ry="12" fill="rgba(0,31,63,0.05)"/>
          <ellipse cx="35" cy="20" rx="20" ry="12" fill="rgba(0,31,63,0.05)"/>
          <ellipse cx="65" cy="18" rx="18" ry="10" fill="rgba(0,31,63,0.05)"/>
        </svg>
      </div>

      {/* route dotted path SVG */}
      <svg className="bg-route" height="60" viewBox="0 0 1400 60" preserveAspectRatio="none">
        <path d="M0 40 Q200 10 400 35 T800 25 T1200 38 T1400 30"
          stroke="rgba(0,31,63,0.08)" strokeWidth="1.5" fill="none"
          strokeDasharray="8 6"/>
      </svg>

      {/* wave at bottom */}
      <svg className="bg-wave" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0 40 Q180 10 360 40 T720 40 T1080 40 T1440 40 L1440 80 L0 80Z" fill="rgba(0,31,63,0.06)"/>
        <path d="M0 50 Q180 20 360 50 T720 50 T1080 50 T1440 50 L1440 80 L0 80Z" fill="rgba(0,31,63,0.04)"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HERO BANNER
═══════════════════════════════════════════════ */
function HeroBanner({ stats, onNew, onExport }) {
  return (
    <div className="inv-hero">
      <div className="hero-glow-bottom" />
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Finance &amp; Billing
          </div>
          <div className="hero-title">
            Invoices &amp; <span>Payments</span>
          </div>
          <div className="hero-sub">
            Manage billing, track payment status, and generate professional invoice documents for all your shipments.
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-val">{stats.total}</div>
              <div className="hero-stat-label">Total</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-val accent">${(stats.revenue / 1000).toFixed(1)}K</div>
              <div className="hero-stat-label">Collected</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-val">{stats.paid}</div>
              <div className="hero-stat-label">Paid</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-val" style={{ color: stats.overdue > 0 ? "#f87171" : "#fff" }}>{stats.overdue}</div>
              <div className="hero-stat-label">Overdue</div>
            </div>
          </div>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={onNew}>＋ New Invoice</button>
            <button className="hero-btn-secondary" onClick={onExport}>📊 Export</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-orbit hero-orbit-2">
            <div className="hero-orbit-dot" style={{ background: "rgba(255,255,255,0.5)" }} />
          </div>
          <div className="hero-orbit hero-orbit-1">
            <div className="hero-orbit-dot" />
          </div>
          <div className="hero-ship-wrap">
            {/* Cargo ship SVG illustration */}
            <svg className="hero-ship-svg" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* water */}
              <ellipse cx="100" cy="118" rx="85" ry="10" fill="rgba(0,100,200,0.15)"/>
              {/* hull */}
              <path d="M20 90 Q22 108 30 112 L170 112 Q178 108 180 90Z" fill="rgba(0,31,63,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              {/* deck */}
              <rect x="30" y="80" width="140" height="12" rx="2" fill="rgba(0,50,100,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              {/* containers row 1 */}
              <rect x="38" y="60" width="24" height="22" rx="3" fill="#FFAB00" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
              <rect x="66" y="60" width="24" height="22" rx="3" fill="rgba(0,31,63,0.7)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
              <rect x="94" y="60" width="24" height="22" rx="3" fill="#e09700" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
              <rect x="122" y="60" width="24" height="22" rx="3" fill="rgba(0,60,120,0.8)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
              {/* containers row 2 */}
              <rect x="50" y="40" width="22" height="22" rx="3" fill="rgba(0,60,120,0.8)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              <rect x="76" y="40" width="22" height="22" rx="3" fill="#FFAB00" opacity="0.8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              <rect x="102" y="40" width="22" height="22" rx="3" fill="rgba(0,31,63,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              {/* chimney */}
              <rect x="148" y="50" width="14" height="32" rx="3" fill="rgba(30,60,100,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              <ellipse cx="155" cy="48" rx="9" ry="5" fill="rgba(20,40,80,0.9)"/>
              {/* smoke */}
              <circle cx="155" cy="38" r="5" fill="rgba(255,255,255,0.08)"/>
              <circle cx="158" cy="28" r="7" fill="rgba(255,255,255,0.05)"/>
              <circle cx="153" cy="20" r="9" fill="rgba(255,255,255,0.04)"/>
              {/* waves */}
              <path d="M15 115 Q40 110 65 115 T115 115 T165 115 T185 115" stroke="rgba(100,180,255,0.25)" strokeWidth="1.5" fill="none"/>
              <path d="M20 120 Q50 116 80 120 T140 120 T180 120" stroke="rgba(100,180,255,0.15)" strokeWidth="1" fill="none"/>
              {/* container lines detail */}
              <line x1="50" y1="60" x2="50" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
              <line x1="78" y1="60" x2="78" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
              <line x1="106" y1="60" x2="106" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
              <line x1="134" y1="60" x2="134" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
            </svg>
            <div className="hero-ship-glow" />
          </div>
          <div className="hero-badge">🚢 7 Active Invoices</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.Unpaid;
  return (
    <span className={`badge ${m.cls}`}>
      <span className="b-dot" style={{ background: m.dot }} /> {status}
    </span>
  );
}

function Toast({ message, icon, onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2700);
    const t2 = setTimeout(onDone, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className={`toast-wrap${out ? " out" : ""}`}>
      <div className="toast-icon">{icon}</div>
      <span>{message}</span>
      <span className="toast-close" onClick={() => { setOut(true); setTimeout(onDone, 300); }}>✕</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INVOICE DETAIL PANEL
═══════════════════════════════════════════════ */
function InvoiceDetail({ invoice, onClose, onToast }) {
  const subtotal   = invoice.items.reduce((s, it) => s + it.qty * it.price, 0);
  const taxAmt     = subtotal * invoice.tax;
  const grandTotal = subtotal + taxAmt;

  return (
    <div className="inv-detail-panel">
      <div className="detail-header">
        <div>
          <div className="detail-inv-id">{invoice.id}</div>
          <div className="detail-inv-title">Invoice Details</div>
          <div className="detail-status-wrap"><StatusBadge status={invoice.status} /></div>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-action-bar">
        <button className="btn-pdf"   onClick={() => onToast("PDF download started", "📄")}>📄 Download PDF</button>
        <button className="btn-email" onClick={() => onToast(`Invoice emailed to ${invoice.customerEmail}`, "📧")}>📧 Email Invoice</button>
      </div>

      <div className="detail-body">
        <div className="detail-parties">
          <div className="party-card">
            <div className="party-card-label">From</div>
            <div className="party-name">{COMPANY.name}</div>
            <div className="party-line">{COMPANY.addr}</div>
            <div className="party-line">{COMPANY.city}</div>
            <div className="party-line">{COMPANY.email}</div>
            <div className="party-line">{COMPANY.phone}</div>
            <div className="party-line" style={{ marginTop: 4, fontWeight: 600, fontSize: 11 }}>{COMPANY.taxId}</div>
          </div>
          <div className="party-card">
            <div className="party-card-label">Bill To</div>
            <div className="party-name">{invoice.customer}</div>
            <div className="party-line">{invoice.customerAddr}</div>
            <div className="party-line">{invoice.customerEmail}</div>
          </div>
        </div>

        <div className="detail-meta">
          {[
            { label: "Invoice ID",   value: invoice.id         },
            { label: "Shipment ID",  value: invoice.shipmentId },
            { label: "Issue Date",   value: fmtDate(invoice.issued) },
            { label: "Due Date",     value: fmtDate(invoice.due)    },
          ].map(m => (
            <div key={m.label} className="meta-item">
              <div className="meta-label">{m.label}</div>
              <div className="meta-value">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="detail-items-label">Line Items</div>
        <table className="items-table">
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i}>
                <td><span className="item-name">{it.desc}</span></td>
                <td>{it.qty}</td>
                <td>{fmt(it.price)}</td>
                <td className="item-total">{fmt(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="detail-totals">
          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-val">{fmt(subtotal)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Tax ({(invoice.tax * 100).toFixed(0)}%)</span>
            <span className="total-val">{fmt(taxAmt)}</span>
          </div>
          <div className="total-row grand">
            <span className="total-label grand-label">Grand Total</span>
            <span className="total-val grand-val">{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function Invoices() {
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("All");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected,  setSelected]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [page,      setPage]      = useState(1);
  const PER_PAGE = 6;

  const fire = (msg, icon = "✅") => setToast({ msg, icon });

  useReveal();

  const filtered = useMemo(() => INVOICES.filter(inv => {
    const q   = search.toLowerCase();
    const okQ = !q || inv.customer.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q) || inv.shipmentId.toLowerCase().includes(q);
    const okS = statusF   === "All" || inv.status === statusF;
    const okT = activeTab === "All" || inv.status === activeTab;
    const okFrom = !dateFrom || inv.issued >= dateFrom;
    const okTo   = !dateTo   || inv.issued <= dateTo;
    return okQ && okS && okT && okFrom && okTo;
  }), [search, statusF, activeTab, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total:       INVOICES.length,
    paid:        INVOICES.filter(i => i.status === "Paid").length,
    unpaid:      INVOICES.filter(i => i.status === "Unpaid").length,
    pending:     INVOICES.filter(i => i.status === "Pending").length,
    overdue:     INVOICES.filter(i => i.status === "Overdue").length,
    revenue:     INVOICES.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0),
    outstanding: INVOICES.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0),
  }), []);

  const TABS  = [
    { label: "All",     count: stats.total   },
    { label: "Paid",    count: stats.paid    },
    { label: "Unpaid",  count: stats.unpaid  },
    { label: "Pending", count: stats.pending },
    { label: "Overdue", count: stats.overdue },
  ];

  const STATS = [
    { icon: "🧾", box: "si-navy",   label: "Total Invoices",   value: stats.total,            pill: null },
    { icon: "💰", box: "si-orange", label: "Revenue Collected", value: fmt(stats.revenue),     pill: { label: "↑ 12.4%", kind: "up" } },
    { icon: "✅", box: "si-green",  label: "Paid",              value: stats.paid,             pill: { label: `${stats.paid}/${stats.total}`, kind: "neu" } },
    { icon: "⚠️", box: "si-red",    label: "Outstanding",       value: fmt(stats.outstanding), pill: { label: `${stats.overdue} overdue`, kind: "down" } },
  ];

  const handleView  = inv => setSelected(selected?.id === inv.id ? null : inv);
  const handleReset = () => { setSearch(""); setStatusF("All"); setDateFrom(""); setDateTo(""); setActiveTab("All"); setPage(1); };

  return (
    <>
      <style>{styles}</style>

      {/* ── ANIMATED BACKGROUND ── */}
      <BackgroundScene />

      <div className="inv-page">
        <div className="inv-body">

          {/* ── HERO BANNER ── */}
          <HeroBanner
            stats={stats}
            onNew={() => fire("New invoice created", "🎉")}
            onExport={() => fire("Export started", "📊")}
          />

          {/* PAGE HEADER */}
          <div className="inv-page-header reveal">
            <div className="inv-page-header-left">
              <div className="inv-eyebrow">Finance</div>
              <h1>Invoices</h1>
              <p>Manage billing, track payments, and generate invoice documents</p>
            </div>
            <div className="inv-header-actions">
              <button className="btn-secondary" onClick={() => fire("Export started", "📊")}>📊 Export</button>
              <button className="btn-primary"   onClick={() => fire("New invoice created", "🎉")}>＋ New Invoice</button>
            </div>
          </div>

          {/* STATS */}
          <div className="inv-stats-strip">
            {STATS.map((s, i) => (
              <div key={s.label} className={`inv-stat-card reveal delay-${i + 1}`}>
                <div className={`stat-icon ${s.box}`}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                  {s.pill
                    ? <span className={`stat-pill pill-${s.pill.kind}`}>{s.pill.label}</span>
                    : <div className="stat-sub">All time</div>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* FILTER BAR */}
          <div className="inv-filter-bar reveal">
            <div className="filter-group">
              <div className="filter-label">From Date</div>
              <input type="date" className="filter-input" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="filter-group">
              <div className="filter-label">To Date</div>
              <input type="date" className="filter-input" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
            </div>
            <div className="filter-divider" />
            <div className="filter-group">
              <div className="filter-label">Status</div>
              <div className="filter-select-wrap">
                <select className="filter-select" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="filter-group" style={{ flex: 2 }}>
              <div className="filter-label">Search Customer / Invoice</div>
              <input
                type="text" className="filter-input"
                placeholder="Search by customer, invoice ID, shipment…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="filter-action-group">
              <button className="btn-filter">🔍 Filter</button>
              <button className="btn-reset" onClick={handleReset}>↺ Reset</button>
            </div>
          </div>

          {/* TABS */}
          <div className="inv-tabs reveal">
            {TABS.map(t => (
              <button
                key={t.label}
                className={`inv-tab${activeTab === t.label ? " active" : ""}`}
                onClick={() => { setActiveTab(t.label); setPage(1); setSelected(null); }}
              >
                {t.label} <span className="tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {/* MAIN SPLIT */}
          <div className={`inv-main reveal${!selected ? " detail-hidden" : ""}`}>

            {/* TABLE */}
            <div className="inv-table-card reveal-scale">
              <div className="table-toolbar">
                <div className="table-toolbar-left">
                  <span className="table-title">Invoice List</span>
                  <span className="table-count-badge">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="table-toolbar-right">
                  <button className="toolbar-btn">⬇ Export</button>
                  <button className="toolbar-btn">🖨 Print</button>
                </div>
              </div>

              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th><th>Shipment ID</th><th>Customer</th>
                    <th>Amount</th><th>Issue Date</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={7}>
                      <div className="inv-empty">
                        <span className="empty-icon">🧾</span>
                        <div className="empty-title">No invoices found</div>
                        <div className="empty-sub">Try adjusting your filters or search term</div>
                      </div>
                    </td></tr>
                  ) : paged.map(inv => {
                    const m        = STATUS_META[inv.status] || STATUS_META.Unpaid;
                    const isActive = selected?.id === inv.id;
                    return (
                      <tr key={inv.id} className={isActive ? "row-active" : ""} onClick={() => handleView(inv)}>
                        <td>
                          <div className="inv-id-cell">
                            <span className="inv-id-dot" style={{ background: m.dot }} />
                            {inv.id}
                          </div>
                        </td>
                        <td style={{ color: "#757575", fontSize: 12.5 }}>{inv.shipmentId}</td>
                        <td style={{ fontWeight: 600, color: "#212121" }}>{inv.customer}</td>
                        <td><span className="amount-val">{fmt(inv.amount)}</span></td>
                        <td>{fmtDate(inv.issued)}</td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td onClick={e => e.stopPropagation()}>
                          <button className={`btn-view${isActive ? " active" : ""}`} onClick={() => handleView(inv)}>
                            {isActive ? "✕ Close" : "👁 View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="inv-pagination">
                  <span className="page-info">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                  <div className="page-btns">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i+1} className={`page-btn${page === i+1 ? " active" : ""}`} onClick={() => setPage(i+1)}>
                        {i+1}
                      </button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                  </div>
                </div>
              )}
            </div>

            {/* DETAIL */}
            {selected && (
              <InvoiceDetail
                key={selected.id}
                invoice={selected}
                onClose={() => setSelected(null)}
                onToast={fire}
              />
            )}
          </div>
        </div>

        {toast && <Toast message={toast.msg} icon={toast.icon} onDone={() => setToast(null)} />}
      </div>
    </>
  );
}
