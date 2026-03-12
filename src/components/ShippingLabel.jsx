// ShippingLabel.jsx — CargoFlow · Navy #001F3F · Accent #FFAB00
// Single-file: CSS inlined, same background/animations as Invoices.jsx
import { useState, useEffect, useRef } from "react";

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

/* ══════════════════════════════════
   KEYFRAMES — identical to Invoices
══════════════════════════════════ */
@keyframes fadeUp    { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
@keyframes toastIn   { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }
@keyframes toastOut  { from{opacity:1;}to{opacity:0;transform:translateX(30px);} }
@keyframes revealUp  { from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);} }
@keyframes revealLeft{ from{opacity:0;transform:translateX(-28px);}to{opacity:1;transform:translateX(0);} }
@keyframes revealScale{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);} }
@keyframes rotateSlow  { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
@keyframes rotateSlowR { from{transform:rotate(0deg);} to{transform:rotate(-360deg);} }
@keyframes floatOrb  {
  0%,100%{transform:translateY(0) scale(1);}
  33%{transform:translateY(-22px) scale(1.04);}
  66%{transform:translateY(10px) scale(0.97);}
}
@keyframes floatOrbB { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.06);} }
@keyframes pulseDot  { 0%,100%{transform:scale(1);opacity:0.6;}50%{transform:scale(1.8);opacity:0.2;} }
@keyframes glowPulse { 0%,100%{opacity:0.12;transform:scale(1);}50%{opacity:0.22;transform:scale(1.08);} }
@keyframes containerBounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);} }
@keyframes particleFly  { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.7;}100%{transform:translateY(-80px) translateX(30px) scale(0);opacity:0;} }
@keyframes particleFly2 { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.5;}100%{transform:translateY(-60px) translateX(-40px) scale(0);opacity:0;} }
@keyframes waveMove    { 0%{transform:translateX(0);}100%{transform:translateX(-50%);} }
@keyframes shipSail    { 0%{transform:translateX(-160px);opacity:0;}5%{opacity:0.18;}90%{opacity:0.18;}100%{transform:translateX(calc(100vw + 160px)) translateY(-18px);opacity:0;} }
@keyframes shipSail2   { 0%{transform:translateX(-200px);opacity:0;}5%{opacity:0.10;}90%{opacity:0.10;}100%{transform:translateX(calc(100vw + 200px)) translateY(12px);opacity:0;} }
@keyframes cloudDrift  { 0%{transform:translateX(-120px);opacity:0;}8%{opacity:0.12;}92%{opacity:0.12;}100%{transform:translateX(calc(100vw + 120px));opacity:0;} }
@keyframes orbitCW1    { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes orbitCW2    { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes orbitCW3    { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
@keyframes scanLine    { 0%{top:-4px;}100%{top:100%;} }
@keyframes barcodeReveal { from{opacity:0;transform:scaleX(0.6);}to{opacity:1;transform:scaleX(1);} }
@keyframes labelFloat  { 0%,100%{transform:translateY(0) rotate(-0.5deg);}50%{transform:translateY(-6px) rotate(0.5deg);} }
@keyframes shimmerSlide{ 0%{background-position:-400px 0;}100%{background-position:400px 0;} }
@keyframes printPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(0,31,63,0.3);}50%{box-shadow:0 0 0 10px rgba(0,31,63,0);} }
@keyframes trackingGlow{ 0%,100%{text-shadow:0 0 20px rgba(255,171,0,0.3);}50%{text-shadow:0 0 40px rgba(255,171,0,0.6);} }

/* ══════════════════════
   BACKGROUND SCENE
══════════════════════ */
.sl-bg {
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none; overflow: hidden;
}

.bg-photo {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80&auto=format&fit=crop');
  background-size: cover;
  background-position: center 40%;
  background-repeat: no-repeat;
  opacity: 0.09;
  filter: saturate(0.6) brightness(0.9);
}
.bg-photo::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg,rgba(245,245,245,0.55) 0%,rgba(245,245,245,0.30) 40%,rgba(245,245,245,0.55) 100%);
}

.sl-bg::before {
  content: ''; position: absolute;
  inset: -100%; width: 300%; height: 300%;
  background-image: radial-gradient(circle, rgba(0,31,63,0.12) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: rotateSlow 40s linear infinite;
  transform-origin: center center;
}
.sl-bg::after {
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
  box-shadow: 0 8px 32px rgba(0,31,63,0.35); filter: blur(2px);
  top:50%; left:50%; transform-origin:-220px -180px;
  animation: orbitCW1 18s linear infinite;
}
.bg-orb-2 {
  width:60px; height:60px;
  background: radial-gradient(circle at 35% 35%, rgba(0,60,120,0.65), #001F3F);
  box-shadow: 0 6px 22px rgba(0,31,63,0.3); filter: blur(1.5px);
  top:50%; left:50%; transform-origin:280px 140px;
  animation: orbitCW2 24s linear infinite;
}
.bg-orb-3 {
  width:44px; height:44px;
  background: radial-gradient(circle at 35% 35%, rgba(0,45,90,0.6), #001F3F);
  box-shadow: 0 4px 16px rgba(0,31,63,0.28); filter: blur(1px);
  top:50%; left:50%; transform-origin:-160px 260px;
  animation: orbitCW3 30s linear infinite;
}
.bg-ring { position:absolute; border-radius:50%; border:1px solid rgba(0,31,63,0.07); pointer-events:none; }
.bg-ring-1 { width:300px; height:300px; top:60px; right:5%; animation:rotateSlow 40s linear infinite; }
.bg-ring-1::after {
  content:''; position:absolute; top:20px; left:50%; width:8px; height:8px;
  background:rgba(255,171,0,0.5); border-radius:50%; transform:translateX(-50%);
  box-shadow:0 0 8px rgba(255,171,0,0.4); animation:pulseDot 2s ease-in-out infinite;
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
.bg-ship  { position:absolute; bottom:18%; left:0; opacity:0; animation:shipSail  28s linear infinite 3s; }
.bg-ship-2{ position:absolute; bottom:24%; left:0; opacity:0; animation:shipSail2 38s linear infinite 14s; }
.bg-cloud  { position:absolute; opacity:0; animation:cloudDrift 40s linear infinite 8s; }
.bg-cloud-2{ position:absolute; opacity:0; animation:cloudDrift 55s linear infinite 22s; }
.bg-route  { position:absolute; top:35%; left:0; width:100%; pointer-events:none; }
.bg-wave   { position:absolute; bottom:0; left:0; width:200%; height:80px; opacity:0.05; animation:waveMove 22s linear infinite; }

/* ══════════════════
   PAGE SHELL
══════════════════ */
.sl-page { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; }
.sl-body {
  flex:1; max-width:900px; margin:0 auto;
  width:100%; padding:32px 24px 60px;
}

/* ══════════════════
   SCROLL REVEAL
══════════════════ */
.reveal { opacity:0; transform:translateY(28px); transition:opacity 0.65s var(--ease),transform 0.65s var(--ease); }
.reveal.visible { opacity:1; transform:translateY(0); }
.reveal-left { opacity:0; transform:translateX(-24px); transition:opacity 0.6s var(--ease),transform 0.6s var(--ease); }
.reveal-left.visible { opacity:1; transform:translateX(0); }
.reveal-scale { opacity:0; transform:scale(0.94); transition:opacity 0.55s var(--ease),transform 0.55s var(--spring); }
.reveal-scale.visible { opacity:1; transform:scale(1); }
.delay-1 { transition-delay:0.08s !important; }
.delay-2 { transition-delay:0.16s !important; }
.delay-3 { transition-delay:0.24s !important; }

/* ══════════════════
   PAGE HEADER STRIP
══════════════════ */
.sl-page-header {
  display:flex; align-items:flex-end; justify-content:space-between;
  margin-bottom:28px;
  animation: revealUp 0.55s var(--ease) both;
}
.sl-page-header-left { display:flex; flex-direction:column; gap:4px; }
.sl-eyebrow {
  font-size:11px; font-weight:700; letter-spacing:1.2px;
  text-transform:uppercase; color:var(--orange); margin-bottom:2px;
  display:flex; align-items:center; gap:6px;
}
.sl-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--orange); animation:pulseDot 2s ease-in-out infinite; }
.sl-page-header h1 {
  font-size:30px; font-weight:800; color:var(--navy);
  letter-spacing:-0.7px; line-height:1;
}
.sl-tracking-id-header {
  display:inline-flex; align-items:center; gap:8px; margin-top:6px;
  background:var(--orange-pale); border:1px solid rgba(255,171,0,0.35);
  border-radius:20px; padding:4px 14px;
}
.sl-tracking-id-header span:first-child {
  font-size:11px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.8px;
}
.sl-tracking-id-header span:last-child {
  font-size:13px; font-weight:800; color:var(--navy); letter-spacing:1px;
  animation: trackingGlow 3s ease-in-out infinite;
}
.sl-header-actions { display:flex; gap:10px; align-items:center; }

/* ══════════════════
   LABEL CARD
══════════════════ */
.sl-label-wrap {
  display:flex; flex-direction:column; align-items:center; gap:24px;
}

.sl-label-card {
  width:100%; max-width:720px;
  background:var(--surface);
  border-radius:var(--r-2xl);
  box-shadow: 0 24px 80px rgba(0,31,63,0.12), 0 4px 24px rgba(0,31,63,0.07), 0 0 0 1px rgba(0,31,63,0.07);
  overflow:hidden;
  animation: revealScale 0.65s var(--spring) 0.1s both;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.sl-label-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 100px rgba(0,31,63,0.16), 0 8px 32px rgba(0,31,63,0.10);
}

/* label top bar */
.sl-label-topbar {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, #001a35 100%);
  padding: 18px 28px;
  display:flex; align-items:center; justify-content:space-between;
  position:relative; overflow:hidden;
}
.sl-label-topbar::before {
  content:''; position:absolute; inset:0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 18px 18px; pointer-events:none;
}
.sl-label-topbar::after {
  content:''; position:absolute; top:-30px; right:-30px;
  width:160px; height:160px; border-radius:50%;
  background:radial-gradient(circle, rgba(255,171,0,0.18) 0%, transparent 70%);
  pointer-events:none;
}
.sl-brand-bar { display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
.sl-brand-logo {
  width:36px; height:36px; border-radius:10px;
  background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.25);
  display:flex; align-items:center; justify-content:center;
  font-size:14px; font-weight:800; color:#fff;
}
.sl-brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:0.04em; }
.sl-brand-sub  { font-size:11px; color:rgba(255,255,255,0.55); margin-top:1px; }
.sl-service-badge {
  position:relative; z-index:1;
  background:linear-gradient(135deg,var(--orange),var(--orange-dark));
  color:var(--navy); font-size:11px; font-weight:800;
  padding:6px 14px; border-radius:20px; text-transform:uppercase; letter-spacing:0.8px;
  box-shadow:0 4px 16px rgba(255,171,0,0.4);
  animation: containerBounce 3s ease-in-out infinite;
}

/* label body */
.sl-label-body { padding:0; }

/* tracking strip */
.sl-tracking-strip {
  background:linear-gradient(90deg, #f4f8ff, #fffbf0, #f4f8ff);
  border-bottom:2px dashed rgba(0,31,63,0.12);
  padding:16px 28px;
  display:flex; align-items:center; justify-content:space-between; gap:16px;
}
.sl-tracking-main { display:flex; flex-direction:column; gap:3px; }
.sl-tracking-label {
  font-size:10px; font-weight:700; color:var(--text-3);
  text-transform:uppercase; letter-spacing:1px;
}
.sl-tracking-number {
  font-size:26px; font-weight:900; color:var(--navy);
  letter-spacing:2px; line-height:1;
  animation: trackingGlow 3s ease-in-out infinite;
}
.sl-tracking-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.sl-weight-pill {
  background:var(--navy); color:#fff;
  font-size:12px; font-weight:700; padding:4px 12px;
  border-radius:20px; letter-spacing:0.5px;
}
.sl-service-pill {
  background:var(--orange-pale); color:var(--orange-dark);
  border:1px solid rgba(255,171,0,0.3);
  font-size:11px; font-weight:700; padding:3px 10px;
  border-radius:20px; text-transform:uppercase; letter-spacing:0.6px;
}

/* parties section */
.sl-parties {
  display:grid; grid-template-columns:1fr 1fr;
  border-bottom:1px solid var(--border);
}
.sl-party {
  padding:20px 28px;
  transition: background 0.2s var(--ease);
}
.sl-party:first-child {
  border-right:1px solid var(--border);
}
.sl-party:hover { background:rgba(0,31,63,0.02); }
.sl-party-header {
  display:flex; align-items:center; gap:8px; margin-bottom:12px;
}
.sl-party-icon {
  width:30px; height:30px; border-radius:9px;
  display:flex; align-items:center; justify-content:center; font-size:14px;
  flex-shrink:0;
}
.sl-party-icon.sender   { background:linear-gradient(135deg,#dce5ef,#c6d5e8); }
.sl-party-icon.receiver { background:linear-gradient(135deg,#fff0c2,#ffe08a); }
.sl-party-type {
  font-size:10px; font-weight:700; color:var(--text-3);
  text-transform:uppercase; letter-spacing:1.2px;
}
.sl-party-name {
  font-size:15px; font-weight:800; color:var(--navy);
  margin-bottom:6px; line-height:1.2;
}
.sl-party-line {
  font-size:12.5px; color:var(--text-2); line-height:1.7;
  display:flex; align-items:flex-start; gap:6px;
}
.sl-party-line-icon { font-size:11px; margin-top:2px; opacity:0.5; flex-shrink:0; }

/* optional fields strip */
.sl-meta-strip {
  display:grid; grid-template-columns:repeat(3,1fr);
  border-bottom:1px solid var(--border);
  background:linear-gradient(90deg,#f9faff,#fafcff);
}
.sl-meta-cell {
  padding:14px 20px; border-right:1px solid var(--border);
  display:flex; flex-direction:column; gap:3px;
  transition:background 0.2s;
}
.sl-meta-cell:last-child { border-right:none; }
.sl-meta-cell:hover { background:rgba(0,31,63,0.03); }
.sl-meta-cell-label {
  font-size:9.5px; font-weight:700; color:var(--text-3);
  text-transform:uppercase; letter-spacing:0.9px;
}
.sl-meta-cell-value {
  font-size:13px; font-weight:700; color:var(--navy);
}

/* barcode / QR section */
.sl-barcode-section {
  padding:22px 28px;
  display:flex; align-items:center; justify-content:space-between; gap:24px;
}
.sl-barcode-left { display:flex; flex-direction:column; gap:10px; }
.sl-barcode-wrap {
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.sl-barcode {
  display:flex; align-items:flex-end; gap:1px; height:56px;
  overflow:hidden; border-radius:4px;
  animation: barcodeReveal 0.6s var(--spring) 0.4s both;
  position:relative;
}
.sl-barcode::after {
  content:''; position:absolute; left:0; right:0; height:3px;
  background:rgba(255,171,0,0.6);
  animation:scanLine 2.4s ease-in-out infinite;
  box-shadow:0 0 6px rgba(255,171,0,0.8);
}
.sl-bar {
  width:2px; background:var(--navy); border-radius:1px;
  transition:height 0.3s var(--spring);
}
.sl-barcode-text {
  font-size:9px; font-weight:700; color:var(--text-3);
  letter-spacing:2px; text-align:center;
}

.sl-qr-wrap {
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.sl-qr {
  width:80px; height:80px; border-radius:8px;
  border:2px solid var(--border-2);
  background:white;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden; position:relative;
}
.sl-qr-grid {
  display:grid; grid-template-columns:repeat(7,1fr); gap:2px;
  padding:6px; width:100%; height:100%;
}
.sl-qr-cell { border-radius:1px; }
.sl-qr-label {
  font-size:9px; font-weight:700; color:var(--text-3);
  text-transform:uppercase; letter-spacing:0.8px;
}

.sl-barcode-info { flex:1; }
.sl-barcode-info-title {
  font-size:12px; font-weight:700; color:var(--text-3);
  text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;
}
.sl-spec-list { display:flex; flex-direction:column; gap:6px; }
.sl-spec-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:6px 10px; background:var(--bg); border-radius:var(--r-sm);
  border:1px solid var(--border);
}
.sl-spec-key { font-size:11.5px; color:var(--text-3); font-weight:500; }
.sl-spec-val { font-size:12px; font-weight:700; color:var(--navy); }

/* label footer */
.sl-label-footer {
  background:var(--navy);
  padding:10px 28px;
  display:flex; align-items:center; justify-content:space-between;
}
.sl-label-footer-left { font-size:10px; color:rgba(255,255,255,0.5); }
.sl-label-footer-right { display:flex; gap:16px; }
.sl-footer-badge {
  font-size:10px; font-weight:700; color:rgba(255,255,255,0.7);
  display:flex; align-items:center; gap:4px;
}
.sl-footer-badge-dot { width:5px; height:5px; border-radius:50%; background:var(--orange); animation:pulseDot 2s ease-in-out infinite; }

/* ══════════════════
   ACTION BUTTONS
══════════════════ */
.sl-actions {
  display:flex; gap:14px; justify-content:center; flex-wrap:wrap;
  animation: revealUp 0.6s var(--ease) 0.5s both;
}
.sl-btn-print {
  height:48px; padding:0 32px;
  background:linear-gradient(135deg, var(--navy-mid), var(--navy));
  color:#fff; font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
  border:none; border-radius:var(--r-lg); cursor:pointer;
  display:flex; align-items:center; gap:9px;
  box-shadow:var(--shadow-navy); transition:all 0.25s var(--ease);
  position:relative; overflow:hidden;
}
.sl-btn-print::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent);
  opacity:0; transition:opacity 0.2s;
}
.sl-btn-print:hover { transform:translateY(-3px); box-shadow:0 14px 40px rgba(0,31,63,0.35); animation:printPulse 1.5s ease-in-out infinite; }
.sl-btn-print:hover::after { opacity:1; }

.sl-btn-pdf {
  height:48px; padding:0 32px;
  background:linear-gradient(135deg,var(--orange),var(--orange-dark));
  color:var(--navy); font-family:'Inter',sans-serif; font-size:14px; font-weight:800;
  border:none; border-radius:var(--r-lg); cursor:pointer;
  display:flex; align-items:center; gap:9px;
  box-shadow:0 6px 22px rgba(255,171,0,0.4); transition:all 0.25s var(--ease);
}
.sl-btn-pdf:hover { transform:translateY(-3px); box-shadow:0 14px 36px rgba(255,171,0,0.5); }

.sl-btn-secondary {
  height:48px; padding:0 24px;
  background:var(--surface); border:1.5px solid var(--border-2);
  color:var(--text-2); font-family:'Inter',sans-serif; font-size:14px; font-weight:600;
  border-radius:var(--r-lg); cursor:pointer;
  display:flex; align-items:center; gap:8px;
  box-shadow:var(--shadow-sm); transition:all 0.2s var(--ease);
}
.sl-btn-secondary:hover { background:var(--orange-pale); border-color:rgba(255,171,0,0.4); color:var(--navy); transform:translateY(-2px); }

/* ══════════════════
   TOAST
══════════════════ */
.toast-wrap {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  background:var(--surface); border-radius:var(--r-lg);
  padding:14px 18px; display:flex; align-items:center; gap:12px;
  font-size:13.5px; font-weight:500; color:var(--text-1);
  box-shadow:var(--shadow-lg); min-width:260px; max-width:360px;
  border-left:4px solid var(--navy); animation:toastIn 0.35s var(--spring) both;
}
.toast-wrap.out { animation:toastOut 0.3s var(--ease) both; }
.toast-icon  { width:32px; height:32px; border-radius:9px; background:#e6edf5; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.toast-close { margin-left:auto; color:var(--text-4); cursor:pointer; font-size:16px; transition:color 0.2s; }
.toast-close:hover { color:var(--text-2); }

/* ══════════════════
   RESPONSIVE
══════════════════ */
@media (max-width:700px) {
  .sl-parties         { grid-template-columns:1fr; }
  .sl-party:first-child { border-right:none; border-bottom:1px solid var(--border); }
  .sl-meta-strip      { grid-template-columns:1fr 1fr; }
  .sl-barcode-section { flex-direction:column; }
  .sl-tracking-number { font-size:20px; }
  .sl-actions         { flex-direction:column; align-items:center; }
}
@media (max-width:500px) {
  .sl-body { padding:16px 12px 48px; }
  .sl-meta-strip { grid-template-columns:1fr; }
}
`;

/* ═══════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════ */
const LABEL = {
  trackingId: "CF-2025-48219-XP",
  sender: {
    name:    "CargoFlow Inc.",
    address: "1 Logistics Plaza, Suite 800",
    city:    "San Francisco, CA 94105",
    contact: "+1 (415) 800-CARGO",
    email:   "dispatch@cargoflow.io",
  },
  receiver: {
    name:    "Alpine Freight Co.",
    address: "12 Mountain Rd, Suite 4",
    city:    "Denver, CO 80201",
    contact: "+1 (303) 555-0192",
    email:   "receiving@alpinefreight.com",
  },
  weight:      "24.5 kg",
  dimensions:  "60 × 40 × 35 cm",
  serviceLevel:"Express Air",
  pieces:       "3",
  date:        "Jan 20, 2025",
  eta:         "Jan 22, 2025",
  shipmentId:  "SHP-4821",
  invoiceRef:  "INV-2025-001",
};

/* barcode bar heights — deterministic pseudo-random */
const BARS = [38,52,44,60,36,56,48,64,40,54,46,60,42,58,50,66,38,52,44,60,36,56,48,64,40,54,46,60,42,58,50,44,38,52,60,36,48,56,64,40,42];

/* QR pattern — 7×7 boolean grid */
const QR = [
  [1,1,1,1,1,1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1],
];
// generate a simple deterministic 7×7 QR-style grid
function genQR() {
  const seed = [1,1,1,1,1,1,1, 1,0,0,0,0,0,1, 1,0,1,1,1,0,1, 1,0,1,0,1,0,1, 1,0,1,1,1,0,1, 1,0,0,0,0,0,1, 1,1,1,1,1,1,1];
  const inner = [0,1,0,0,1, 1,0,1,1,0, 0,1,0,1,1, 1,1,0,0,1, 0,0,1,0,1];
  // 9×9 grid
  const g = [];
  for (let r=0;r<9;r++) { g.push([]); for(let c=0;c<9;c++) g[r].push(Math.abs(Math.sin(r*9+c)*100)%1 > 0.45 ? 1:0); }
  // corner finders
  [[0,0],[0,6],[6,0]].forEach(([rr,cc])=>{
    for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++) g[rr+dr][cc+dc]=1;
  });
  return g;
}
const QR_GRID = genQR();

/* ═══════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-left,.reveal-scale");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold:0.12, rootMargin:"0px 0px -40px 0px" }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════
   BACKGROUND SCENE  (identical to Invoices)
═══════════════════════════════════════════════ */
function BackgroundScene() {
  return (
    <div className="sl-bg" aria-hidden="true">
      <div className="bg-photo" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-ring bg-ring-1" />
      <div className="bg-ring bg-ring-2" />
      <div className="bg-ring bg-ring-3" />
      <div className="bg-box bg-box-1" />
      <div className="bg-box bg-box-2" />
      <div className="bg-box bg-box-3" />
      <div className="bg-particle bg-p1" />
      <div className="bg-particle bg-p2" />
      <div className="bg-particle bg-p3" />
      <div className="bg-particle bg-p4" />
      <div className="bg-particle bg-p5" />
      <div className="bg-ship">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
          <rect x="10" y="30" width="100" height="16" rx="4" fill="rgba(0,31,63,0.5)"/>
          <rect x="20" y="22" width="24" height="10" rx="2" fill="rgba(0,31,63,0.4)"/>
          <rect x="50" y="18" width="20" height="14" rx="2" fill="rgba(0,31,63,0.35)"/>
          <rect x="76" y="24" width="16" height="8"  rx="2" fill="rgba(0,31,63,0.4)"/>
          <path d="M10 46 Q60 52 110 46" stroke="rgba(0,63,128,0.3)" strokeWidth="2" fill="none"/>
        </svg>
      </div>
      <div className="bg-ship-2">
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
          <rect x="6" y="20" width="68" height="12" rx="3" fill="rgba(0,31,63,0.3)"/>
          <rect x="14" y="14" width="16" height="8"  rx="2" fill="rgba(0,31,63,0.25)"/>
          <rect x="34" y="12" width="14" height="10" rx="2" fill="rgba(0,31,63,0.22)"/>
        </svg>
      </div>
      <div className="bg-cloud" style={{top:"8%"}}>
        <svg width="140" height="50" viewBox="0 0 140 50" fill="none">
          <ellipse cx="70" cy="35" rx="60" ry="18" fill="rgba(0,31,63,0.07)"/>
          <ellipse cx="50" cy="28" rx="30" ry="16" fill="rgba(0,31,63,0.07)"/>
          <ellipse cx="90" cy="25" rx="25" ry="14" fill="rgba(0,31,63,0.07)"/>
        </svg>
      </div>
      <div className="bg-cloud-2" style={{top:"15%"}}>
        <svg width="100" height="36" viewBox="0 0 100 36" fill="none">
          <ellipse cx="50" cy="26" rx="42" ry="12" fill="rgba(0,31,63,0.05)"/>
          <ellipse cx="35" cy="20" rx="20" ry="12" fill="rgba(0,31,63,0.05)"/>
          <ellipse cx="65" cy="18" rx="18" ry="10" fill="rgba(0,31,63,0.05)"/>
        </svg>
      </div>
      <svg className="bg-route" height="60" viewBox="0 0 1400 60" preserveAspectRatio="none">
        <path d="M0 40 Q200 10 400 35 T800 25 T1200 38 T1400 30"
          stroke="rgba(0,31,63,0.08)" strokeWidth="1.5" fill="none" strokeDasharray="8 6"/>
      </svg>
      <svg className="bg-wave" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0 40 Q180 10 360 40 T720 40 T1080 40 T1440 40 L1440 80 L0 80Z" fill="rgba(0,31,63,0.06)"/>
        <path d="M0 50 Q180 20 360 50 T720 50 T1080 50 T1440 50 L1440 80 L0 80Z" fill="rgba(0,31,63,0.04)"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function Toast({ message, icon, onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2700);
    const t2 = setTimeout(onDone, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className={`toast-wrap${out?" out":""}`}>
      <div className="toast-icon">{icon}</div>
      <span>{message}</span>
      <span className="toast-close" onClick={() => { setOut(true); setTimeout(onDone,300); }}>✕</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BARCODE SVG
═══════════════════════════════════════════════ */
function Barcode() {
  return (
    <div className="sl-barcode-wrap">
      <div className="sl-barcode">
        {BARS.map((h, i) => (
          <div key={i} className="sl-bar" style={{ height: h + "%" }} />
        ))}
      </div>
      <div className="sl-barcode-text">{LABEL.trackingId}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   QR CODE SVG
═══════════════════════════════════════════════ */
function QRCode() {
  const size = 9;
  return (
    <div className="sl-qr-wrap">
      <div className="sl-qr">
        <svg width="68" height="68" viewBox="0 0 9 9">
          {QR_GRID.map((row, r) =>
            row.map((cell, c) =>
              cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#001F3F" rx="0.1"/> : null
            )
          )}
        </svg>
      </div>
      <div className="sl-qr-label">Scan to Track</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function ShippingLabel() {
  const [toast, setToast] = useState(null);
  const fire = (msg, icon = "✅") => setToast({ msg, icon });

  useReveal();

  return (
    <>
      <style>{styles}</style>
      <BackgroundScene />

      <div className="sl-page">
        <div className="sl-body">

          {/* ── PAGE HEADER ── */}
          <div className="sl-page-header">
            <div className="sl-page-header-left">
              <div className="sl-eyebrow">
                <span className="sl-eyebrow-dot" />
                Logistics · Label Generator
              </div>
              <h1>Shipping Label</h1>
              <div className="sl-tracking-id-header">
                <span>Tracking ID</span>
                <span>{LABEL.trackingId}</span>
              </div>
            </div>
            <div className="sl-header-actions">
              <button className="sl-btn-secondary" onClick={() => fire("Label link copied!", "🔗")}>
                🔗 Share
              </button>
              <button className="sl-btn-secondary" onClick={() => fire("Label duplicated", "📋")}>
                📋 Duplicate
              </button>
            </div>
          </div>

          {/* ── LABEL WRAP ── */}
          <div className="sl-label-wrap">

            {/* ── LABEL CARD ── */}
            <div className="sl-label-card">

              {/* TOP BAR */}
              <div className="sl-label-topbar">
                <div className="sl-brand-bar">
                  <div className="sl-brand-logo">CF</div>
                  <div>
                    <div className="sl-brand-name">CargoFlow</div>
                    <div className="sl-brand-sub">Certified Carrier · Est. 2018</div>
                  </div>
                </div>
                <div className="sl-service-badge">✈ {LABEL.serviceLevel}</div>
              </div>

              {/* TRACKING STRIP */}
              <div className="sl-tracking-strip">
                <div className="sl-tracking-main">
                  <div className="sl-tracking-label">Tracking Number</div>
                  <div className="sl-tracking-number">{LABEL.trackingId}</div>
                </div>
                <div className="sl-tracking-right">
                  <span className="sl-weight-pill">⚖ {LABEL.weight}</span>
                  <span className="sl-service-pill">📦 {LABEL.pieces} Pieces</span>
                </div>
              </div>

              {/* SENDER / RECEIVER */}
              <div className="sl-parties">
                <div className="sl-party">
                  <div className="sl-party-header">
                    <div className="sl-party-icon sender">📤</div>
                    <div className="sl-party-type">From · Sender</div>
                  </div>
                  <div className="sl-party-name">{LABEL.sender.name}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">📍</span>{LABEL.sender.address}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">🏙</span>{LABEL.sender.city}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">📞</span>{LABEL.sender.contact}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">✉</span>{LABEL.sender.email}</div>
                </div>
                <div className="sl-party">
                  <div className="sl-party-header">
                    <div className="sl-party-icon receiver">📥</div>
                    <div className="sl-party-type">To · Receiver</div>
                  </div>
                  <div className="sl-party-name">{LABEL.receiver.name}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">📍</span>{LABEL.receiver.address}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">🏙</span>{LABEL.receiver.city}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">📞</span>{LABEL.receiver.contact}</div>
                  <div className="sl-party-line"><span className="sl-party-line-icon">✉</span>{LABEL.receiver.email}</div>
                </div>
              </div>

              {/* OPTIONAL META STRIP */}
              <div className="sl-meta-strip">
                {[
                  { label:"Shipment ID",  value: LABEL.shipmentId  },
                  { label:"Invoice Ref",  value: LABEL.invoiceRef  },
                  { label:"Ship Date",    value: LABEL.date        },
                  { label:"Est. Delivery",value: LABEL.eta         },
                  { label:"Weight",       value: LABEL.weight      },
                  { label:"Dimensions",   value: LABEL.dimensions  },
                ].map(m => (
                  <div key={m.label} className="sl-meta-cell">
                    <div className="sl-meta-cell-label">{m.label}</div>
                    <div className="sl-meta-cell-value">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* BARCODE + QR + SPECS */}
              <div className="sl-barcode-section">
                <div className="sl-barcode-left">
                  <Barcode />
                  <QRCode />
                </div>
                <div className="sl-barcode-info">
                  <div className="sl-barcode-info-title">Shipment Specs</div>
                  <div className="sl-spec-list">
                    {[
                      { k:"Service Level", v: LABEL.serviceLevel },
                      { k:"Package Weight",v: LABEL.weight       },
                      { k:"Dimensions",    v: LABEL.dimensions   },
                      { k:"No. of Pieces", v: LABEL.pieces       },
                      { k:"Ship Date",     v: LABEL.date         },
                      { k:"Delivery ETA",  v: LABEL.eta          },
                    ].map(s => (
                      <div key={s.k} className="sl-spec-row">
                        <span className="sl-spec-key">{s.k}</span>
                        <span className="sl-spec-val">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LABEL FOOTER */}
              <div className="sl-label-footer">
                <span className="sl-label-footer-left">
                  cargoflow.io · {LABEL.trackingId}
                </span>
                <div className="sl-label-footer-right">
                  <span className="sl-footer-badge"><span className="sl-footer-badge-dot"/>Verified Carrier</span>
                  <span className="sl-footer-badge"><span className="sl-footer-badge-dot" style={{background:"#0fa869"}}/>Customs Cleared</span>
                </div>
              </div>

            </div>{/* end .sl-label-card */}

            {/* ── ACTION BUTTONS ── */}
            <div className="sl-actions">
              <button className="sl-btn-print" onClick={() => { fire("Sending to printer…","🖨"); setTimeout(()=>window.print(),300); }}>
                🖨 Print Label
              </button>
              <button className="sl-btn-pdf" onClick={() => fire("PDF download started","📄")}>
                📄 Download as PDF
              </button>
              <button className="sl-btn-secondary" onClick={() => fire("Label emailed to receiver","📧")}>
                📧 Email to Receiver
              </button>
            </div>

          </div>{/* end .sl-label-wrap */}
        </div>

        {toast && <Toast message={toast.msg} icon={toast.icon} onDone={() => setToast(null)} />}
      </div>
    </>
  );
}
