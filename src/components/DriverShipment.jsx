import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import SignaturePad from 'signature_pad';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DriverShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [shipment, setShipment] = useState({
    id: id || 'SH-482',
    status: 'IN PROGRESS',
    lastUpdate: '2 min ago',
    eta: '10:45 AM',
    customer: 'Michael Chen',
    phone: '+1 (415) 555-7890',
    address: '2845 Mission Street, Apt 4B, San Francisco, CA 94110',
    notes: 'Call upon arrival. Gate code 4782#. Leave in locker if no answer.',
    deliveryLat: 37.7577,
    deliveryLng: -122.4376,
    driverLat: 37.7523,
    driverLng: -122.4342
  });

  const [driverPos, setDriverPos] = useState([shipment.driverLat, shipment.driverLng]);
  const [deliveryPos] = useState([shipment.deliveryLat, shipment.deliveryLng]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', isSuccess: true });

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);
  const videoStreamRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([37.7545, -122.435], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, CartoDB'
      }).addTo(map);

      // Delivery marker (orange)
      const deliveryIcon = L.divIcon({
        html: `<div style="background: #f57c3a; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0b1a2f; box-shadow: 0 0 0 2px #ffb27a;"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      // Driver marker (blue truck)
      const driverIcon = L.divIcon({
        html: `<div style="position:relative;"><div style="background:#3b9eff; width:22px; height:22px; border-radius:50%; border:3px solid #0b1a2f; box-shadow:0 0 0 2px #9aceff;"></div><i class="fas fa-truck" style="position:absolute; top:5px; left:5px; color:white; font-size:12px;"></i></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      // Add markers
      deliveryMarkerRef.current = L.marker(deliveryPos, { icon: deliveryIcon }).addTo(map).bindPopup('Delivery point');
      driverMarkerRef.current = L.marker(driverPos, { icon: driverIcon }).addTo(map).bindPopup('Your truck');
      
      // Add route line
      routeLineRef.current = L.polyline([driverPos, deliveryPos], {
        color: '#f57c3a', weight: 3, opacity: 0.6, dashArray: '8, 8'
      }).addTo(map);

      // Fit bounds
      map.fitBounds(L.latLngBounds([deliveryPos, driverPos]), { padding: [50, 50] });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update driver marker when position changes
  useEffect(() => {
    if (driverMarkerRef.current && mapInstanceRef.current) {
      driverMarkerRef.current.setLatLng(driverPos);
      
      // Update route line
      if (routeLineRef.current) {
        mapInstanceRef.current.removeLayer(routeLineRef.current);
      }
      routeLineRef.current = L.polyline([driverPos, deliveryPos], {
        color: '#f57c3a', weight: 3, opacity: 0.6, dashArray: '8, 8'
      }).addTo(mapInstanceRef.current);
    }
  }, [driverPos, deliveryPos]);

  // Show toast
  const showToast = (message, isSuccess = true) => {
    setToast({ show: true, message, isSuccess });
    setTimeout(() => setToast({ show: false, message: '', isSuccess: true }), 3000);
  };

  // Handle status change
  const setStatus = (icon, text, bgColor, textColor) => {
    setShipment(prev => ({ ...prev, status: text }));
    showToast(`Status: ${text}`);
  };

  // Handle driver movement
  const moveDriver = () => {
    const dx = deliveryPos[0] - driverPos[0];
    const dy = deliveryPos[1] - driverPos[1];
    const newPos = [driverPos[0] + dx * 0.2, driverPos[1] + dy * 0.2];
    setDriverPos(newPos);
    showToast('Driver position updated');
  };

  // Handle camera
  const openCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showToast('Camera access denied or not available', false);
      setShowCameraModal(false);
      
      // Fallback to file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            addImagePreview(event.target.result);
            showToast('Photo selected (simulated upload)');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      
      addImagePreview(imageData);
      
      // Stop camera
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setShowCameraModal(false);
      showToast('Photo captured!');
    }
  };

  const closeCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCameraModal(false);
  };

  // Handle signature
  const openSignature = () => {
    setShowSignatureModal(true);
    setTimeout(() => {
      if (canvasRef.current && !signaturePadRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        signaturePadRef.current = new SignaturePad(canvasRef.current, {
          backgroundColor: 'white',
          penColor: '#0b1a2f'
        });
      }
    }, 100);
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      showToast('Please provide a signature first', false);
      return;
    }
    
    const signatureData = signaturePadRef.current.toDataURL('image/png');
    
    // Add to preview as a badge
    const newFile = {
      type: 'signature',
      data: signatureData,
      id: Date.now()
    };
    setUploadedFiles(prev => [...prev, newFile]);
    
    setShowSignatureModal(false);
    showToast('Signature saved!');
  };

  const closeSignature = () => {
    setShowSignatureModal(false);
  };

  // Add image preview
  const addImagePreview = (src) => {
    const newFile = {
      type: 'image',
      data: src,
      id: Date.now()
    };
    setUploadedFiles(prev => [...prev, newFile]);
  };

  // Remove file
  const removeFile = (id) => {
    if (window.confirm('Remove this item?')) {
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  // Handle note save
  const handleNoteBlur = () => {
    if (deliveryNote.trim()) {
      showToast('Note saved locally');
    }
  };

  // Format coordinates
  const formatCoords = (pos) => {
    return `${pos[0].toFixed(4)}° N, ${pos[1].toFixed(4)}° W`;
  };

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

  return (
    <div style={{ 
      backgroundColor: '#0b1a2f', 
      color: '#eef3fc', 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: ff
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 20px;
          display: inline-block;
          margin-right: 5px;
        }
        .dot-delivery { background: #f57c3a; border: 2px solid #ffdcb5; }
        .dot-driver { background: #3b9eff; border: 2px solid #a3ceff; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          background: '#10243e',
          padding: '1rem 2rem',
          borderRadius: '60px',
          border: '1px solid #2e4a70',
          boxShadow: '0 8px 18px #00000040'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: '#f57c3a',
              background: '#1f3450',
              padding: '0.3rem 1.8rem',
              borderRadius: '60px',
              border: '1px solid #f57c3a'
            }}>
              {shipment.id}
            </div>
            <div style={{
              background: '#f57c3a',
              color: '#0b1a2f',
              padding: '0.5rem 2rem',
              borderRadius: '40px',
              fontWeight: 700,
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #ffb27a'
            }}>
              <i className="fas fa-rotate"></i> {shipment.status}
            </div>
          </div>
          <div style={{ color: '#b3c9e5', fontSize: '0.9rem' }}>
            <i className="fas fa-clock" style={{ color: '#f57c3a', marginRight: '5px' }}></i> 
            Last updated: {shipment.lastUpdate} · 
            <i className="fas fa-map-pin" style={{ color: '#f57c3a', marginLeft: '8px', marginRight: '5px' }}></i> 
            ETA {shipment.eta}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.8fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Left Card */}
          <div style={{
            background: '#10243e',
            borderRadius: '32px',
            border: '1px solid #2a4162',
            padding: '2rem 1.8rem',
            boxShadow: '0 15px 30px #00000060'
          }}>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#f2e5d7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '2px solid #f57c3a40',
              paddingBottom: '0.6rem'
            }}>
              <i className="fas fa-user-circle" style={{ color: '#f57c3a' }}></i> Customer & delivery
            </div>

            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#cfdefa' }}>
              <i className="fas fa-user" style={{ width: 24, color: '#f57c3a', fontSize: '1.2rem' }}></i> {shipment.customer}
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#cfdefa' }}>
              <i className="fas fa-phone-alt" style={{ width: 24, color: '#f57c3a', fontSize: '1.2rem' }}></i> {shipment.phone}
            </div>
            <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#cfdefa' }}>
              <i className="fas fa-location-dot" style={{ width: 24, color: '#f57c3a', fontSize: '1.2rem' }}></i> {shipment.address}
            </div>

            <div style={{
              background: '#0b1a2f',
              padding: '1rem',
              borderRadius: '20px',
              margin: '1.5rem 0 2rem 0',
              borderLeft: '5px solid #f57c3a',
              fontStyle: 'italic',
              color: '#e0eaff'
            }}>
              <i className="fas fa-note-sticky" style={{ color: '#f57c3a', marginRight: '8px' }}></i>
              "{shipment.notes}"
            </div>

            {/* Status Actions */}
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#f2e5d7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '2px solid #f57c3a40',
              paddingBottom: '0.6rem'
            }}>
              <i className="fas fa-tasks" style={{ color: '#f57c3a' }}></i> Status actions
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0 2rem 0' }}>
              {[
                { icon: 'fa-box-open', label: 'Start Pickup', onClick: () => setStatus('fa-box-open', 'PICKUP STARTED', '#f57c3a', '#0b1a2f') },
                { icon: 'fa-truck', label: 'Start Transit', onClick: () => setStatus('fa-truck', 'IN TRANSIT', '#f57c3a', '#0b1a2f') },
                { icon: 'fa-check-circle', label: 'Mark Delivered', onClick: () => setStatus('fa-check-circle', 'DELIVERED', '#2e6b4c', '#e0f0e8') },
                { icon: 'fa-exclamation-triangle', label: 'Delivery Failed', onClick: () => setStatus('fa-exclamation-triangle', 'FAILED', '#b13e3e', '#ffe1e1') }
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  style={{
                    background: 'transparent',
                    border: '2px solid #f57c3a',
                    color: '#f57c3a',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '40px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: '1 0 auto',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f57c3a';
                    e.target.style.color = '#0b1a2f';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 12px #f57c3a30';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#f57c3a';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className={`fas ${btn.icon}`}></i> {btn.label}
                </button>
              ))}
            </div>

            {/* Notes & Proof */}
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#f2e5d7',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '2px solid #f57c3a40',
              paddingBottom: '0.6rem'
            }}>
              <i className="fas fa-pen" style={{ color: '#f57c3a' }}></i> Notes & proof
            </div>

            <textarea
              rows="3"
              placeholder="Add notes (e.g. Left with security guard, gate code, etc.)"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              onBlur={handleNoteBlur}
              style={{
                width: '100%',
                background: '#1d334f',
                border: '1px solid #3f5a7c',
                borderRadius: '24px',
                padding: '1.2rem',
                color: '#f0e6da',
                fontSize: '0.95rem',
                resize: 'vertical',
                margin: '0.5rem 0 1.2rem 0',
                outline: 'none'
              }}
            />

            {/* Preview area */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' }}>
              {uploadedFiles.map(file => (
                file.type === 'image' ? (
                  <img
                    key={file.id}
                    src={file.data}
                    onClick={() => removeFile(file.id)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '2px solid #f57c3a',
                      cursor: 'pointer'
                    }}
                  />
                ) : (
                  <div
                    key={file.id}
                    onClick={() => removeFile(file.id)}
                    style={{
                      background: '#1f3450',
                      borderRadius: '30px',
                      padding: '0.3rem 1rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid #f57c3a',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-signature"></i> Signature captured
                  </div>
                )
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={openCamera}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: '0.2s',
                  flex: '1 1 150px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2b4b72';
                  e.target.style.borderColor = '#f57c3a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#1f3a5a';
                  e.target.style.borderColor = '#f57c3a60';
                }}
              >
                <i className="fas fa-camera" style={{ color: '#f57c3a' }}></i> Upload Photo
              </button>
              <button
                onClick={openSignature}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: '0.2s',
                  flex: '1 1 150px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2b4b72';
                  e.target.style.borderColor = '#f57c3a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#1f3a5a';
                  e.target.style.borderColor = '#f57c3a60';
                }}
              >
                <i className="fas fa-signature" style={{ color: '#f57c3a' }}></i> Capture Signature
              </button>
            </div>
          </div>

          {/* Right Card - Map */}
          <div style={{
            background: '#0e2037',
            borderRadius: '32px',
            border: '1px solid #2a4162',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 15px 30px #00000060'
          }}>
            <div style={{
              padding: '1.2rem 1.8rem',
              background: '#102842',
              borderBottom: '2px solid #f57c3a40',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500, color: '#b3c9e5' }}>
                <i className="fas fa-map-marked-alt" style={{ color: '#f57c3a', marginRight: '5px' }}></i> Live Tracking
              </span>
              <div>
                <span className="legend-dot dot-delivery"></span> Delivery
                <span style={{ marginLeft: '15px' }} className="legend-dot dot-driver"></span> Your truck
              </div>
            </div>
            
            <div ref={mapRef} id="driverMap" style={{ width: '100%', height: '350px', background: '#1a2f48' }}></div>
            
            <div style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <i className="fas fa-location-dot" style={{ color: '#3b9eff' }}></i>
              <span style={{ color: '#cfdefa' }}>
                Driver position: <span id="driverCoords">{formatCoords(driverPos)}</span>
              </span>
              <button
                onClick={moveDriver}
                style={{
                  marginLeft: 'auto',
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-play" style={{ color: '#f57c3a' }}></i> Move
              </button>
            </div>
          </div>
        </div>

        {/* Backend Note */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1rem 2rem',
          background: '#0a1c30',
          borderRadius: '60px',
          borderLeft: '5px solid #f57c3a',
          fontSize: '0.85rem',
          color: '#b1cdf5',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          border: '1px solid #2c4769'
        }}>

        </div>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#10243e',
            borderRadius: '32px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            border: '2px solid #f57c3a'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              color: '#f57c3a'
            }}>
              <h3><i className="fas fa-camera"></i> Take Photo</h3>
              <button
                onClick={closeCamera}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f57c3a',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>
            <div style={{
              width: '100%',
              height: '300px',
              background: '#1d334f',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={capturePhoto}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-camera"></i> Capture
              </button>
              <button
                onClick={closeCamera}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#10243e',
            borderRadius: '32px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            border: '2px solid #f57c3a'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              color: '#f57c3a'
            }}>
              <h3><i className="fas fa-signature"></i> Capture Signature</h3>
              <button
                onClick={closeSignature}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f57c3a',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >×</button>
            </div>
            <canvas
              ref={canvasRef}
              width="500"
              height="200"
              style={{
                width: '100%',
                height: '200px',
                background: 'white',
                borderRadius: '16px',
                touchAction: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={clearSignature}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-eraser"></i> Clear
              </button>
              <button
                onClick={saveSignature}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-check"></i> Save
              </button>
              <button
                onClick={closeSignature}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #f57c3a60',
                  color: '#f2e5d7',
                  padding: '0.7rem 1.5rem',
                  borderRadius: '40px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: toast.isSuccess ? '#f57c3a' : '#b13e3e',
          color: '#0b1a2f',
          padding: '1rem 2rem',
          borderRadius: '60px',
          fontWeight: 600,
          boxShadow: '0 10px 25px #f57c3a80',
          zIndex: 999,
          border: '2px solid #ffc59b',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DriverShipment;