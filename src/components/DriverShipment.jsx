import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import SignaturePad from 'signature_pad';
import 'leaflet/dist/leaflet.css';
import { writeLocation } from '../locationStore';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const haversineKm = ([lat1, lng1], [lat2, lng2]) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fmtCoords = ([lat, lng]) =>
  `${lat.toFixed(5)}° N, ${Math.abs(lng).toFixed(5)}° W`;

// ── SVG icons (inline, no Font Awesome needed) ────────────────────────────────

// Truck SVG — distinct diamond shape so it's never confused with stop pins
const makeDriverIcon = (live) => L.divIcon({
  className: '',
  html: `
    <div style="
      position:relative;width:46px;height:46px;
      background:${live ? '#10b981' : '#2563eb'};
      border-radius:12px 12px 12px 0;
      transform:rotate(-45deg);
      border:3px solid #fff;
      box-shadow:0 4px 14px ${live ? '#10b98190' : '#2563eb90'};
      ${live ? 'animation:gps-ring 1.6s ease-out infinite;' : ''}
    ">
      <svg viewBox="0 0 24 24" width="22" height="22"
        style="position:absolute;top:9px;left:9px;transform:rotate(45deg);"
        fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v4h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    </div>`,
  iconSize: [46, 46],
  iconAnchor: [10, 46],
  popupAnchor: [13, -46],
});

// House/delivery pin
const makeDeliveryIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:38px;height:46px;">
      <div style="background:#f57c3a;width:38px;height:38px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 12px #f57c3a80;"></div>
      <svg viewBox="0 0 24 24" width="18" height="18"
        style="position:absolute;top:8px;left:10px;"
        fill="#fff">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </div>`,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  popupAnchor: [0, -46],
});

// Warehouse pin (green)
const makeWarehouseIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:38px;height:46px;">
      <div style="background:#10b981;width:38px;height:38px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 12px #10b98180;"></div>
      <svg viewBox="0 0 24 24" width="18" height="18"
        style="position:absolute;top:8px;left:10px;"
        fill="#fff">
        <path d="M22 9V7l-10-5L2 7v2l1 1v10h18V10l1-1zM12 4.5L20 9H4l8-4.5zM20 19H4v-9h16v9z"/>
        <rect x="9" y="13" width="6" height="6" fill="#fff"/>
      </svg>
    </div>`,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
  popupAnchor: [0, -46],
});

// Numbered stop pin — delivery📦 / pickup📤 / return↩
const makeStopIcon = (num, status, type) => {
  const isDone   = status === 'completed';
  const isActive = status === 'in-transit';
  const bg       = isDone ? '#64748b' : isActive ? '#f57c3a' : '#3b9eff';
  const pulse    = isActive ? 'animation:gps-ring 1.6s ease-out infinite;' : '';

  // pick SVG path per type
  const svgPath =
    type === 'pickup'
      ? `<path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.51 16.49 1 14.64 1c-1.04 0-1.96.52-2.64 1.36L12 3l-.36-.64C10.96 1.52 10.04 1 9 1 7.51 1 6 2.51 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5.36-3c.98 0 1.36.62 1.36 1.64 0 1.33-1.03 2.61-2 3.36-.97-.75-2-2.03-2-3.36C12 3.62 12.38 3 13.36 3h1.28zM9 3c.98 0 1.36.62 1.36 1.64 0 1.33-1.03 2.61-2 3.36-.97-.75-2-2.03-2-3.36C6.36 3.62 6.74 3 7.72 3H9zM20 21H4V8h4.08C7.38 8.96 6 10.32 6 12c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.68-1.38-3.04-2.08-4H20v13z" fill="#fff"/>`
      : type === 'return'
      ? `<path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41L20 5.41z" fill="#fff"/>`
      : `<path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" fill="#fff"/>`;

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:38px;height:46px;">
        <div style="background:${bg};width:38px;height:38px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 12px ${bg}80;${pulse}"></div>
        <svg viewBox="0 0 24 24" width="18" height="18"
          style="position:absolute;top:8px;left:10px;">
          ${svgPath}
        </svg>
        <div style="position:absolute;bottom:-2px;right:-4px;background:#0b1a2f;color:#fff;
          font-size:10px;font-weight:800;width:16px;height:16px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;border:2px solid ${bg};">
          ${isDone ? '✓' : num}
        </div>
      </div>`,
    iconSize: [38, 46],
    iconAnchor: [19, 46],
    popupAnchor: [0, -46],
  });
};

let accuracyCircle = null;
const setAccuracyCircle = (map, latlng, radius) => {
  if (accuracyCircle) map.removeLayer(accuracyCircle);
  accuracyCircle = radius > 0
    ? L.circle(latlng, { radius, color: '#10b981', fillColor: '#10b981', fillOpacity: 0.07, weight: 1, dashArray: '4 4' }).addTo(map)
    : null;
};

const DriverShipment = () => {
  const { id } = useParams();
  const SHIPMENT_ID = id || 'SH-482';

  const routeStops = [
    { id: 1, customer: 'Priya Sharma',     address: 'Bandra West, Mumbai',          time: '9:30 AM',  status: 'completed', type: 'delivery', pkg: '#PKG-10254', lat: 19.0596, lng: 72.8295 },
    { id: 2, customer: 'Amit Verma',       address: 'Andheri East, Mumbai',         time: '10:15 AM', status: 'completed', type: 'delivery', pkg: '#PKG-10255', lat: 19.1136, lng: 72.8697 },
    { id: 3, customer: 'Sunita Patel',     address: 'Dadar, Mumbai',                time: '11:00 AM', status: 'in-transit',type: 'delivery', pkg: '#PKG-10256', lat: 19.0178, lng: 72.8478 },
    { id: 4, customer: 'Ravi Mehta',       address: 'Kurla, Mumbai',                time: '11:45 AM', status: 'pending',   type: 'pickup',   pkg: '#PKG-10257', lat: 19.0728, lng: 72.8826 },
    { id: 5, customer: 'Kavita Singh',     address: 'Chembur, Mumbai',              time: '12:30 PM', status: 'pending',   type: 'delivery', pkg: '#PKG-10258', lat: 19.0522, lng: 72.8994 },
    { id: 6, customer: 'Warehouse Return', address: 'Bhiwandi Warehouse, Thane',    time: '1:15 PM',  status: 'pending',   type: 'return',   pkg: '#RMA-3302',  lat: 19.2813, lng: 73.0476 },
  ];

  const activeStop = routeStops.find(s => s.status === 'in-transit') || routeStops.find(s => s.status === 'pending');

  const [shipment] = useState({
    id: SHIPMENT_ID,
    eta: '10:45 AM',
    customer: activeStop?.customer || 'Sunita Patel',
    phone: '+91 98765 43210',
    address: activeStop?.address || 'Dadar, Mumbai, Maharashtra 400014',
    notes: 'Call upon arrival. Gate code 4782#. Leave in locker if no answer.',
  });

  const deliveryPos = activeStop ? [activeStop.lat, activeStop.lng] : [19.0178, 72.8478];
  const warehousePos = [19.2813, 73.0476]; // Bhiwandi Warehouse, Thane

  const [driverPos, setDriverPos] = useState([19.0760, 72.8777]); // Mumbai central
  const [shipStatus, setShipStatus] = useState('IN PROGRESS');
  const [lastUpdate, setLastUpdate] = useState('—');
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy]     = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCameraModal, setShowCameraModal]       = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', ok: true });

  const mapRef         = useRef(null);
  const mapInst        = useRef(null);
  const driverMarker   = useRef(null);
  const deliveryMarker = useRef(null);
  const routeLine      = useRef(null);
  const watchId        = useRef(null);
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const sigPad         = useRef(null);
  const videoStream    = useRef(null);

  const toast$ = (msg, ok = true) => {
    setToast({ show: true, message: msg, ok });
    setTimeout(() => setToast({ show: false, message: '', ok: true }), 3500);
  };

  // ── map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([19.0760, 72.8777], 12);

    // OpenStreetMap — free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // ── Warehouse start marker ──
    L.marker(warehousePos, { icon: makeWarehouseIcon() })
      .addTo(map)
      .bindPopup('<b style="color:#10b981">🏭 Start: Warehouse A</b>');

    // ── All route stop markers ──
    routeStops.forEach((stop) => {
      L.marker([stop.lat, stop.lng], { icon: makeStopIcon(stop.id, stop.status, stop.type) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px;">
            <b style="color:${stop.status === 'completed' ? '#64748b' : stop.status === 'in-transit' ? '#f57c3a' : '#3b9eff'}">
              Stop ${stop.id} — ${stop.status === 'completed' ? '✅ Done' : stop.status === 'in-transit' ? '🔵 In Transit' : '⏳ Pending'}
            </b><br/>
            <b>${stop.customer}</b><br/>
            <span style="color:#555;font-size:0.82rem;">${stop.address}</span><br/>
            <span style="font-size:0.78rem;color:#888;">🕐 ${stop.time} · ${stop.pkg}</span>
          </div>`);
    });

    // ── Route polyline through all stops ──
    const allPoints = [warehousePos, ...routeStops.map(s => [s.lat, s.lng])];
    // Completed segment — grey dashed
    const doneStops = routeStops.filter(s => s.status === 'completed');
    if (doneStops.length > 0) {
      L.polyline([warehousePos, ...doneStops.map(s => [s.lat, s.lng])], {
        color: '#94a3b8', weight: 3, opacity: 0.5, dashArray: '6 6',
      }).addTo(map);
    }
    // Remaining segment — orange
    const remaining = routeStops.filter(s => s.status !== 'completed');
    if (remaining.length > 0) {
      const fromPoint = doneStops.length > 0
        ? [doneStops[doneStops.length - 1].lat, doneStops[doneStops.length - 1].lng]
        : warehousePos;
      L.polyline([fromPoint, ...remaining.map(s => [s.lat, s.lng])], {
        color: '#f57c3a', weight: 3, opacity: 0.7, dashArray: '10 8',
      }).addTo(map);
    }

    // ── Driver marker ──
    driverMarker.current = L.marker(driverPos, { icon: makeDriverIcon(false), zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<b style="color:#3b9eff">🚚 Your Location</b>');

    // ── Delivery marker for active stop ──
    deliveryMarker.current = L.marker(deliveryPos, { icon: makeDeliveryIcon() })
      .addTo(map)
      .bindPopup(`<b style="color:#f57c3a">📦 Current Delivery</b><br/>${shipment.address}`);

    // ── Route line driver → active stop ──
    routeLine.current = L.polyline([driverPos, deliveryPos], {
      color: '#10b981', weight: 3, opacity: 0.8, dashArray: '6 5',
    }).addTo(map);

    // Fit all markers
    map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] });
    mapInst.current = map;
    setDistanceKm(haversineKm(driverPos, deliveryPos));

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (accuracyCircle && mapInst.current) mapInst.current.removeLayer(accuracyCircle);
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, []); // eslint-disable-line

  // ── sync marker when driverPos changes ───────────────────────────────────
  useEffect(() => {
    if (!mapInst.current || !driverMarker.current) return;
    driverMarker.current.setLatLng(driverPos);
    driverMarker.current.setIcon(makeDriverIcon(isTracking));
    if (routeLine.current) mapInst.current.removeLayer(routeLine.current);
    routeLine.current = L.polyline([driverPos, deliveryPos], {
      color: '#f57c3a', weight: 3, opacity: 0.7, dashArray: '10 8',
    }).addTo(mapInst.current);
    setDistanceKm(haversineKm(driverPos, deliveryPos));
  }, [driverPos, isTracking]); // eslint-disable-line

  // ── GPS tracking ──────────────────────────────────────────────────────────
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast$('Geolocation not supported by this browser.', false); return;
    }
    // Immediate fix
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const ll = [coords.latitude, coords.longitude];
        setDriverPos(ll);
        setAccuracy(Math.round(coords.accuracy));
        setLastUpdate(new Date().toLocaleTimeString());
        mapInst.current?.panTo(ll, { animate: true, duration: 1 });
        setAccuracyCircle(mapInst.current, ll, coords.accuracy);
        // ✅ broadcast to Tracking + CustomerTrackingResult
        writeLocation(SHIPMENT_ID, coords.latitude, coords.longitude, Math.round(coords.accuracy));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // Continuous watch
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const ll = [coords.latitude, coords.longitude];
        setDriverPos(ll);
        setAccuracy(Math.round(coords.accuracy));
        setLastUpdate(new Date().toLocaleTimeString());
        mapInst.current?.panTo(ll, { animate: true, duration: 0.8 });
        setAccuracyCircle(mapInst.current, ll, coords.accuracy);
        // ✅ broadcast to Tracking + CustomerTrackingResult
        writeLocation(SHIPMENT_ID, coords.latitude, coords.longitude, Math.round(coords.accuracy));
      },
      (err) => { toast$(`GPS error: ${err.message}`, false); stopTracking(); },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
    );
    setIsTracking(true);
    toast$('🛰️ Live GPS tracking started — visible to tracking pages');
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (accuracyCircle && mapInst.current) {
      mapInst.current.removeLayer(accuracyCircle);
      accuracyCircle = null;
    }
    setIsTracking(false);
    setAccuracy(null);
    toast$('GPS tracking stopped');
  };

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const centreOnDelivery = () => {
    mapInst.current?.flyTo(deliveryPos, 16, { animate: true, duration: 1.2 });
    deliveryMarker.current?.openPopup();
  };
  const centreOnDriver = () => {
    mapInst.current?.flyTo(driverPos, 16, { animate: true, duration: 1.2 });
    driverMarker.current?.openPopup();
  };
  const fitBoth = () => {
    const allPoints = [driverPos, warehousePos, ...routeStops.map(s => [s.lat, s.lng])];
    mapInst.current?.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], animate: true });
  };

  // ── camera / signature helpers ────────────────────────────────────────────
  const openCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast$('Camera not available', false);
      setShowCameraModal(false);
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = (e) => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => addImg(ev.target.result);
        r.readAsDataURL(f);
      };
      inp.click();
    }
  };
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const c = document.createElement('canvas');
    c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight;
    c.getContext('2d').drawImage(videoRef.current, 0, 0);
    addImg(c.toDataURL('image/png'));
    closeCamera(); toast$('Photo captured!');
  };
  const closeCamera = () => { videoStream.current?.getTracks().forEach(t => t.stop()); setShowCameraModal(false); };
  const openSignature = () => {
    setShowSignatureModal(true);
    setTimeout(() => {
      if (canvasRef.current && !sigPad.current) {
        canvasRef.current.width  = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        sigPad.current = new SignaturePad(canvasRef.current, { backgroundColor: 'white', penColor: '#0b1a2f' });
      }
    }, 100);
  };
  const saveSignature = () => {
    if (!sigPad.current || sigPad.current.isEmpty()) { toast$('Please sign first', false); return; }
    setUploadedFiles(p => [...p, { type: 'signature', data: sigPad.current.toDataURL(), id: Date.now() }]);
    setShowSignatureModal(false); toast$('Signature saved!');
  };
  const addImg = (src) => setUploadedFiles(p => [...p, { type: 'image', data: src, id: Date.now() }]);
  const removeFile = (fid) => { if (window.confirm('Remove this item?')) setUploadedFiles(p => p.filter(f => f.id !== fid)); };

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const btnBase = { background:'#1f3a5a', border:'1px solid #f57c3a60', color:'#f2e5d7', padding:'0.65rem 1.3rem', borderRadius:'40px', fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'7px', cursor:'pointer' };

  return (
    <div style={{ backgroundColor:'#0b1a2f', color:'#eef3fc', minHeight:'100vh', padding:'2rem', fontFamily:ff }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes gps-ring {
          0%   { box-shadow: 0 0 0 0   #10b98180; }
          70%  { box-shadow: 0 0 0 14px #10b98100; }
          100% { box-shadow: 0 0 0 0   #10b98100; }
        }
        .gps-pulse { animation: gps-ring 1.6s ease-out infinite; }
        @keyframes slideIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }
        .map-ctrl-btn:hover { background:#2b4b72 !important; border-color:#f57c3a !important; }
        .status-btn:hover { background:#f57c3a !important; color:#0b1a2f !important; transform:translateY(-2px); }
        .leaflet-control-attribution { background:rgba(11,26,47,0.8)!important; color:#b3c9e5!important; }
        .leaflet-control-attribution a { color:#f57c3a!important; }
      `}</style>

      <div style={{ maxWidth:1340, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', background:'#10243e', padding:'1rem 2rem', borderRadius:'60px', border:'1px solid #2e4a70', boxShadow:'0 8px 18px #00000040' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <div style={{ fontSize:'2rem', fontWeight:700, color:'#f57c3a', background:'#1f3450', padding:'0.3rem 1.8rem', borderRadius:'60px', border:'1px solid #f57c3a' }}>
              {shipment.id}
            </div>
            <div style={{ background:'#f57c3a', color:'#0b1a2f', padding:'0.5rem 2rem', borderRadius:'40px', fontWeight:700, fontSize:'1.05rem', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'8px', border:'1px solid #ffb27a' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#0b1a2f"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              {shipStatus}
            </div>
            {isTracking && (
              <div style={{ background:'#10b98120', color:'#10b981', border:'1px solid #10b981', padding:'0.4rem 1.2rem', borderRadius:'40px', fontWeight:700, fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'6px' }}>
                <span className="gps-pulse" style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#10b981' }}></span>
                GPS LIVE — broadcasting
              </div>
            )}
          </div>
          <div style={{ color:'#b3c9e5', fontSize:'0.88rem', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
            <span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#f57c3a" style={{marginRight:4,verticalAlign:'middle'}}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
              Updated: {lastUpdate} &nbsp;·&nbsp;
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#f57c3a" style={{marginRight:4,verticalAlign:'middle'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              ETA {shipment.eta}
            </span>
            {distanceKm !== null && (
              <span style={{ color:'#f57c3a', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#f57c3a"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(2)} km`} to delivery
              </span>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1.15fr 1.85fr', gap:'2rem', marginBottom:'2rem' }}>

          {/* Left panel */}
          <div style={{ background:'#10243e', borderRadius:'32px', border:'1px solid #2a4162', padding:'2rem 1.8rem', boxShadow:'0 15px 30px #00000060' }}>
            <SecTitle icon="fa-user-circle" label="Customer & delivery" />
            <InfoRow icon="fa-user"         text={shipment.customer} />
            <InfoRow icon="fa-phone-alt"    text={shipment.phone} />
            <InfoRow icon="fa-location-dot" text={shipment.address} />
            <div style={{ background:'#0b1a2f', padding:'1rem', borderRadius:'20px', margin:'1.5rem 0 2rem', borderLeft:'5px solid #f57c3a', fontStyle:'italic', color:'#e0eaff', display:'flex', gap:8, alignItems:'flex-start' }}>
              {SVG['fa-note-sticky']}
              <span>"{shipment.notes}"</span>
            </div>

            <SecTitle icon="fa-tasks" label="Status actions" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.8rem', margin:'1.2rem 0 2rem' }}>
              {[
                { svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.51 16.49 1 14.64 1c-1.04 0-1.96.52-2.64 1.36L12 3l-.36-.64C10.96 1.52 10.04 1 9 1 7.51 1 6 2.51 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>, label:'Start Pickup',    val:'PICKUP STARTED' },
                { svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>, label:'Start Transit',   val:'IN TRANSIT' },
                { svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>, label:'Mark Delivered',  val:'DELIVERED' },
                { svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>, label:'Delivery Failed', val:'FAILED' },
              ].map(b => (
                <button key={b.val} className="status-btn"
                  onClick={() => { setShipStatus(b.val); toast$(`Status: ${b.val}`); }}
                  style={{ background:'transparent', border:'2px solid #f57c3a', color:'#f57c3a', padding:'0.75rem 1.3rem', borderRadius:'40px', fontWeight:600, fontSize:'0.88rem', display:'inline-flex', alignItems:'center', gap:'7px', cursor:'pointer', transition:'all 0.2s', flex:'1 0 auto', justifyContent:'center' }}>
                  {b.svg} {b.label}
                </button>
              ))}
            </div>

            <SecTitle icon="fa-pen" label="Notes & proof" />
            <textarea rows={3} placeholder="Add notes…" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)}
              style={{ width:'100%', background:'#1d334f', border:'1px solid #3f5a7c', borderRadius:'20px', padding:'1rem', color:'#f0e6da', fontSize:'0.93rem', resize:'vertical', margin:'0.5rem 0 1rem', outline:'none' }} />

            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', margin:'0.5rem 0 1rem' }}>
              {uploadedFiles.map(f =>
                f.type === 'image'
                  ? <img key={f.id} src={f.data} onClick={() => removeFile(f.id)} style={{ width:58, height:58, borderRadius:10, objectFit:'cover', border:'2px solid #f57c3a', cursor:'pointer' }} />
                  : <div key={f.id} onClick={() => removeFile(f.id)} style={{ background:'#1f3450', borderRadius:30, padding:'0.3rem 1rem', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:5, border:'1px solid #f57c3a', cursor:'pointer' }}>{SVG['fa-signature']} Signature</div>
              )}
            </div>

            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
              <button className="map-ctrl-btn" onClick={openCamera}    style={{ ...btnBase, flex:'1 1 140px', justifyContent:'center' }}>
                {SVG['fa-camera']} Upload Photo
              </button>
              <button className="map-ctrl-btn" onClick={openSignature} style={{ ...btnBase, flex:'1 1 140px', justifyContent:'center' }}>
                {SVG['fa-signature']} Capture Signature
              </button>
            </div>
          </div>

          {/* Right panel — Map */}
          <div style={{ background:'#0e2037', borderRadius:'32px', border:'1px solid #2a4162', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 15px 30px #00000060' }}>

            {/* Map header */}
            <div style={{ padding:'1rem 1.6rem', background:'#102842', borderBottom:'2px solid #f57c3a40', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
              <span style={{ fontWeight:600, color:'#eef3fc', fontSize:'1rem', display:'flex', alignItems:'center', gap:6 }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f57c3a" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Live Tracking &nbsp;
                <span style={{ fontSize:'0.75rem', color:'#b3c9e5', fontWeight:400 }}>OpenStreetMap · Leaflet</span>
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', fontSize:'0.82rem', color:'#b3c9e5', flexWrap:'wrap' }}>
                <LegendDot color="#10b981" label="Warehouse" />
                <LegendDot color="#94a3b8" label="Completed" />
                <LegendDot color="#f57c3a" label="Active stop" />
                <LegendDot color="#3b9eff" label="Pending" />
                <LegendDot color={isTracking ? '#10b981' : '#3b9eff'} label="Your truck" />
              </div>
            </div>

            {/* Leaflet map */}
            <div ref={mapRef} style={{ width:'100%', height:'420px' }} />

            {/* Map footer */}
            <div style={{ padding:'0.9rem 1.4rem', background:'#0b1a2f', borderTop:'1px solid #1e3a5a', display:'flex', flexWrap:'wrap', gap:'0.7rem', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, minWidth:200 }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill={isTracking ? '#10b981' : '#3b9eff'}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span style={{ color:'#cfdefa', fontSize:'0.85rem' }}>
                  {fmtCoords(driverPos)}
                  {accuracy !== null && <span style={{ color:'#b3c9e5', marginLeft:6 }}>±{accuracy} m</span>}
                </span>
              </div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {!isTracking
                  ? <button onClick={startTracking} style={{ background:'#10b981', border:'none', color:'#fff', padding:'0.65rem 1.4rem', borderRadius:'40px', fontWeight:700, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'7px', cursor:'pointer' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>
                      Start GPS
                    </button>
                  : <button onClick={stopTracking} style={{ background:'#b13e3e', border:'none', color:'#fff', padding:'0.65rem 1.4rem', borderRadius:'40px', fontWeight:700, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:'7px', cursor:'pointer' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                      Stop GPS
                    </button>
                }
                {/* Centre on driver */}
                <button className="map-ctrl-btn" onClick={centreOnDriver} style={btnBase} title="Centre on my location">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b9eff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                </button>
                {/* Centre on delivery */}
                <button className="map-ctrl-btn" onClick={centreOnDelivery} style={btnBase} title="Centre on delivery">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                </button>
                {/* Fit all */}
                <button className="map-ctrl-btn" onClick={fitBoth} style={btnBase} title="Fit all stops">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#b3c9e5" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                </button>
              </div>
            </div>

            {/* Stop progress strip */}
            <div style={{ padding:'0.8rem 1.2rem', background:'#102842', borderTop:'1px solid #1e3a5a', display:'flex', gap:'6px', overflowX:'auto' }}>
              {routeStops.map(stop => {
                const isDone   = stop.status === 'completed';
                const isActive = stop.status === 'in-transit';
                const color    = isDone ? '#94a3b8' : isActive ? '#f57c3a' : '#3b9eff';
                return (
                  <div key={stop.id}
                    onClick={() => mapInst.current?.flyTo([stop.lat, stop.lng], 16, { animate: true, duration: 1 })}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', minWidth:52, padding:'4px 6px', borderRadius:10, background: isActive ? '#f57c3a20' : 'transparent', border: isActive ? '1px solid #f57c3a60' : '1px solid transparent' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:12 }}>
                      {isDone ? '✓' : stop.id}
                    </div>
                    <span style={{ fontSize:9, color:'#b3c9e5', textAlign:'center', lineHeight:1.2 }}>{stop.customer.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <Modal title="Take Photo" icon="fa-camera" onClose={closeCamera}>
          <div style={{ width:'100%', height:280, background:'#1d334f', borderRadius:14, overflow:'hidden' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.2rem', justifyContent:'flex-end' }}>
            <button style={btnBase} onClick={capturePhoto}>{SVG['fa-camera']} Capture</button>
            <button style={btnBase} onClick={closeCamera}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <Modal title="Capture Signature" icon="fa-signature" onClose={() => setShowSignatureModal(false)}>
          <canvas ref={canvasRef} width={500} height={180} style={{ width:'100%', height:180, background:'white', borderRadius:12, touchAction:'none' }} />
          <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.2rem', justifyContent:'flex-end' }}>
            <button style={btnBase} onClick={() => sigPad.current?.clear()}>{SVG['fa-eraser']} Clear</button>
            <button style={btnBase} onClick={saveSignature}>{SVG['fa-check']} Save</button>
            <button style={btnBase} onClick={() => setShowSignatureModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast.show && (
        <div style={{ position:'fixed', bottom:28, right:28, background: toast.ok ? '#f57c3a' : '#b13e3e', color:'#0b1a2f', padding:'0.9rem 2rem', borderRadius:'60px', fontWeight:700, boxShadow:'0 10px 28px #00000060', zIndex:9999, animation:'slideIn 0.3s ease', border:'2px solid #ffc59b' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ── SVG icon map for SecTitle / InfoRow ──────────────────────────────────────
const SVG = {
  'fa-user-circle': <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>,
  'fa-tasks':       <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M3 5h2V3H3v2zm0 8h2v-2H3v2zm0 8h2v-2H3v2zm4-16v2h14V5H7zm0 10h14v-2H7v2zm0 8h14v-2H7v2z"/></svg>,
  'fa-pen':         <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  'fa-user':        <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  'fa-phone-alt':   <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>,
  'fa-location-dot':<svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  'fa-note-sticky': <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2zm-5 15v-4h4l-4 4z"/></svg>,
  'fa-camera':      <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>,
  'fa-signature':   <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  'fa-eraser':      <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.03 20H20v-2h-6.21l7.62-7.62c.78-.78.78-2.05 0-2.83l-4.86-4.96c-.39-.39-.9-.59-1.41-.59z"/></svg>,
  'fa-check':       <svg viewBox="0 0 24 24" width="16" height="16" fill="#f57c3a"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>,
};

const SecTitle = ({ icon, label }) => (
  <div style={{ fontSize:'1.1rem', fontWeight:600, color:'#f2e5d7', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem', borderBottom:'2px solid #f57c3a40', paddingBottom:'0.5rem' }}>
    {SVG[icon] || null} {label}
  </div>
);
const InfoRow = ({ icon, text }) => (
  <div style={{ marginBottom:'0.75rem', display:'flex', alignItems:'flex-start', gap:12, color:'#cfdefa' }}>
    <span style={{ flexShrink:0, marginTop:2 }}>{SVG[icon] || null}</span>
    <span>{text}</span>
  </div>
);
const LegendDot = ({ color, label }) => (
  <span style={{ display:'flex', alignItems:'center', gap:5 }}>
    <span style={{ width:11, height:11, borderRadius:'50%', background:color, display:'inline-block', border:`2px solid ${color}80` }}></span>
    {label}
  </span>
);
const Modal = ({ title, icon, onClose, children }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'center' }}>
    <div style={{ background:'#10243e', borderRadius:28, padding:'2rem', maxWidth:580, width:'90%', border:'2px solid #f57c3a' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem', color:'#f57c3a' }}>
        <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>{SVG[icon] || null} {title}</h3>
        <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#f57c3a', fontSize:'1.6rem', cursor:'pointer', lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export default DriverShipment;
