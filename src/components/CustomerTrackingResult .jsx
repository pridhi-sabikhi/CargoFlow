import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CustomerTrackingResult = () => {
  const navigate = useNavigate();
  
  // State
  const [trackingId, setTrackingId] = useState('SH-482');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', isSuccess: true });

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const distanceMarkerRef = useRef(null);

  // Sample shipment database
  const shipments = {
    'SH-482': {
      id: 'SH-482',
      status: 'in-transit',
      statusText: 'IN TRANSIT',
      statusIcon: 'fa-rotate',
      customer: 'Michael Chen',
      phone: '+1 (415) 555-7890',
      address: '2845 Mission Street, Apt 4B, San Francisco, CA 94110',
      driver: 'Elena Rossi · Truck #482',
      eta: '10:45 AM (in ~25 min)',
      notes: 'Call upon arrival. Gate code 4782#. Leave in locker if no answer.',
      deliveryPos: [37.7520, -122.4186],
      driverPos: [37.7749, -122.4194],
      progress: ['pickup', 'transit', 'delivery'],
      currentStep: 1
    },
    'SH-921': {
      id: 'SH-921',
      status: 'delivered',
      statusText: 'DELIVERED',
      statusIcon: 'fa-check-circle',
      customer: 'Sarah Johnson',
      phone: '+1 (415) 555-1234',
      address: '1560 Haight Street, San Francisco, CA 94117',
      driver: 'James Wilson · Truck #215',
      eta: 'Delivered at 09:20 AM',
      notes: 'Left with receptionist. Signature on file.',
      deliveryPos: [37.7697, -122.4485],
      driverPos: [37.7697, -122.4485],
      progress: ['pickup', 'transit', 'delivery'],
      currentStep: 2
    },
    'DEMO-1': {
      id: 'DEMO-1',
      status: 'pickup',
      statusText: 'PICKUP',
      statusIcon: 'fa-box-open',
      customer: 'Tech Corp',
      phone: '+1 (415) 555-0001',
      address: '795 Folsom Street, San Francisco, CA 94107',
      driver: 'Maria Garcia · Truck #107',
      eta: '11:30 AM',
      notes: 'Loading dock at rear. Need to sign at reception first.',
      deliveryPos: [37.7825, -122.4010],
      driverPos: [37.7875, -122.4080],
      progress: ['pickup', 'transit', 'delivery'],
      currentStep: 0
    }
  };

  // Default shipment
  const defaultShipment = shipments['SH-482'];

  // Show toast
  const showToast = (message, isSuccess = true) => {
    setToast({ show: true, message, isSuccess });
    setTimeout(() => setToast({ show: false, message: '', isSuccess: true }), 3000);
  };

  // Calculate distance between two points in km
  const calculateDistance = (pos1, pos2) => {
    const R = 6371;
    const lat1 = pos1[0] * Math.PI / 180;
    const lat2 = pos2[0] * Math.PI / 180;
    const dlat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dlng = (pos2[1] - pos1[1]) * Math.PI / 180;
    
    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dlng/2) * Math.sin(dlng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Clear map layers
  const clearMapLayers = () => {
    if (deliveryMarkerRef.current) mapInstanceRef.current.removeLayer(deliveryMarkerRef.current);
    if (driverMarkerRef.current) mapInstanceRef.current.removeLayer(driverMarkerRef.current);
    if (routeLineRef.current) mapInstanceRef.current.removeLayer(routeLineRef.current);
    if (distanceMarkerRef.current) mapInstanceRef.current.removeLayer(distanceMarkerRef.current);
  };

  // Fit map to markers
  const fitMapToMarkers = () => {
    if (deliveryMarkerRef.current && driverMarkerRef.current && mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        deliveryMarkerRef.current.getLatLng(),
        driverMarkerRef.current.getLatLng()
      ]);
      mapInstanceRef.current.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15
      });
    }
  };

  // Update map with shipment data
  const updateMap = (shipmentData) => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
        zoomControl: true
      });
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, CartoDB'
      }).addTo(mapInstanceRef.current);
    } else {
      clearMapLayers();
    }

    // Create custom icons
    const deliveryIcon = L.divIcon({
      html: `<div style="background: #f57c3a; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #0b1a2f; box-shadow: 0 0 0 2px #ffb27a, 0 0 15px rgba(245,124,58,0.5);"></div>`,
      className: 'delivery-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const driverIcon = L.divIcon({
      html: `<div style="position:relative;">
        <div style="background:#3b9eff; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #0b1a2f; box-shadow: 0 0 0 2px #9aceff, 0 0 15px rgba(59,158,255,0.5);"></div>
        <i class="fas fa-truck" style="position: absolute; top: 6px; left: 6px; color: white; font-size: 14px; text-shadow: 0 0 3px black;"></i>
      </div>`,
      className: 'driver-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add markers with popups
    deliveryMarkerRef.current = L.marker(shipmentData.deliveryPos, { icon: deliveryIcon }).addTo(mapInstanceRef.current)
      .bindPopup(`
        <b style="color:#0b1a2f;">Delivery Location</b><br>
        <span style="color:#f57c3a;">${shipmentData.customer}</span><br>
        <small>${shipmentData.address}</small>
      `);

    driverMarkerRef.current = L.marker(shipmentData.driverPos, { icon: driverIcon }).addTo(mapInstanceRef.current)
      .bindPopup(`
        <b style="color:#0b1a2f;">Current Driver Position</b><br>
        <span style="color:#3b9eff;">${shipmentData.driver}</span><br>
        <small>ETA: ${shipmentData.eta}</small>
      `);

    // Add route line
    routeLineRef.current = L.polyline([shipmentData.driverPos, shipmentData.deliveryPos], {
      color: '#f57c3a',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    // Add distance marker in the middle
    const midPoint = [
      (shipmentData.driverPos[0] + shipmentData.deliveryPos[0]) / 2,
      (shipmentData.driverPos[1] + shipmentData.deliveryPos[1]) / 2
    ];
    
    const distance = calculateDistance(shipmentData.driverPos, shipmentData.deliveryPos);
    
    distanceMarkerRef.current = L.marker(midPoint, {
      icon: L.divIcon({
        html: `<div style="background: #1f3450; padding: 0.2rem 0.8rem; border-radius: 40px; border: 1px solid #f57c3a; color: white; font-size: 0.9rem;">${distance} km</div>`,
        className: 'distance-marker',
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      })
    }).addTo(mapInstanceRef.current);

    // Fit map to show both markers
    setTimeout(() => {
      fitMapToMarkers();
    }, 100);
  };

  // Update progress steps
  const renderProgressSteps = (shipmentData) => {
    const steps = [
      { icon: 'fa-box-open', label: 'Pickup' },
      { icon: 'fa-truck', label: 'In Transit' },
      { icon: 'fa-check-circle', label: 'Delivered' }
    ];

    return steps.map((step, index) => {
      let statusClass = '';
      if (index < shipmentData.currentStep) statusClass = 'completed';
      else if (index === shipmentData.currentStep) statusClass = 'active';

      return (
        <div key={index} className={`step ${statusClass}`} style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          opacity: statusClass ? 1 : 0.5
        }}>
          <div className="step-icon" style={{
            width: '36px',
            height: '36px',
            background: statusClass === 'completed' ? '#2e6b4c' : statusClass === 'active' ? '#f57c3a' : '#1f3450',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: statusClass === 'active' ? '#0b1a2f' : 'white',
            boxShadow: statusClass === 'active' ? '0 0 0 4px #f57c3a30' : 'none'
          }}>
            <i className={`fas ${step.icon}`}></i>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#f2e5d7' }}>{step.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#b3c9e5' }}>
              {index < shipmentData.currentStep ? 'Completed' : (index === shipmentData.currentStep ? 'In progress' : 'Pending')}
            </div>
          </div>
        </div>
      );
    });
  };

  // Handle track button click
  const handleTrack = (e) => {
    e.preventDefault();
    
    let id = trackingId.trim().toUpperCase();
    
    if (!id) {
      id = 'SH-482';
      setTrackingId(id);
    }

    setIsLoading(true);
    setShowResult(false);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      let foundShipment = shipments[id];
      
      if (!foundShipment) {
        // Try partial match
        const found = Object.values(shipments).find(s => 
          s.id.includes(id) || id.includes(s.id)
        );
        
        if (found) {
          foundShipment = found;
          showToast(`Showing closest match: ${found.id}`, false);
        } else {
          foundShipment = defaultShipment;
          showToast(`No match for "${id}", showing default`, false);
        }
      }

      setShipment(foundShipment);
      setShowResult(true);
      
      // Update map after shipment is set
      setTimeout(() => {
        updateMap(foundShipment);
      }, 100);
      
      showToast(`✓ Tracking details loaded for ${foundShipment.id}`);
    }, 800);
  };

  // Handle copy button
  const copyToClipboard = async () => {
    const text = shipment?.id || 'SH-482';
    try {
      await navigator.clipboard.writeText(text);
      showToast('✓ Tracking ID copied!');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('✓ Tracking ID copied!');
    }
  };

  // Map control handlers
  const handleFitBounds = () => {
    fitMapToMarkers();
    showToast('Showing both locations');
  };

  const handleCenterDriver = () => {
    if (driverMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.setView(driverMarkerRef.current.getLatLng(), 14);
      driverMarkerRef.current.openPopup();
      showToast('Centered on driver');
    }
  };

  const handleCenterDelivery = () => {
    if (deliveryMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.setView(deliveryMarkerRef.current.getLatLng(), 14);
      deliveryMarkerRef.current.openPopup();
      showToast('Centered on delivery location');
    }
  };

  // Load default on mount
  useEffect(() => {
    setTimeout(() => {
      setShipment(defaultShipment);
      setShowResult(true);
      setTimeout(() => {
        updateMap(defaultShipment);
      }, 100);
    }, 500);
  }, []);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
        .input-group:focus-within {
          border-color: #f57c3a !important;
          box-shadow: 0 0 0 4px #f57c3a30 !important;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tracking Form Section */}
        <div style={{
          background: '#10243e',
          borderRadius: '60px',
          padding: '2.5rem',
          border: '1px solid #2e4a70',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '1.5rem'
          }}>
            <i className="fas fa-truck-fast" style={{
              fontSize: '2.5rem',
              color: '#f57c3a',
              background: '#1f3a5a',
              padding: '15px',
              borderRadius: '50%',
              border: '2px solid #f57c3a'
            }}></i>
            <span style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#f2e5d7'
            }}>LogiTrack</span>
          </div>

          <form onSubmit={handleTrack} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div className="input-group" style={{
              display: 'flex',
              background: '#1d334f',
              borderRadius: '80px',
              border: '2px solid #2e4a70',
              overflow: 'hidden'
            }}>
              <i className="fas fa-hashtag" style={{
                padding: '0 0 0 1.5rem',
                display: 'flex',
                alignItems: 'center',
                color: '#f57c3a'
              }}></i>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID (e.g. SH-482, DEMO-1, SH-921)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '1.2rem 1rem',
                  width: '100%',
                  color: '#f0e6da',
                  fontSize: '1.1rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#b3b3b3' : '#f57c3a',
                border: '2px solid #f57c3a',
                borderRadius: '80px',
                padding: '1.2rem',
                color: isLoading ? '#666' : '#0b1a2f',
                fontWeight: 700,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#ff9555';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#f57c3a';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Tracking...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i> Track Shipment
                </>
              )}
            </button>
          </form>

          <div style={{
            background: '#0b1f37',
            borderRadius: '40px',
            padding: '1.5rem 2rem',
            marginTop: '2rem',
            border: '1px solid #2c4a70'
          }}>
            <div style={{
              color: '#f57c3a',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              <i className="fas fa-info-circle"></i> What you'll see:
            </div>
            <ul style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              listStyle: 'none'
            }}>
              {[
                { icon: 'fa-box', text: 'Shipment status & ETA' },
                { icon: 'fa-user', text: 'Customer details' },
                { icon: 'fa-truck', text: 'Driver information' },
                { icon: 'fa-map-marked-alt', text: 'Live tracking map' },
                { icon: 'fa-clock', text: 'Progress history' },
                { icon: 'fa-phone', text: 'Contact options' }
              ].map((item, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#cfdefa'
                }}>
                  <i className={`fas ${item.icon}`} style={{ color: '#f57c3a', width: '24px' }}></i>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <span>Try IDs:</span>
            {['SH-482', 'DEMO-1', 'SH-921'].map((id, index) => (
              <span
                key={id}
                onClick={() => setTrackingId(id)}
                style={{
                  background: index === 0 ? '#1a3150' : '#0b1a2f',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '40px',
                  fontFamily: 'monospace',
                  fontSize: '1.2rem',
                  color: index === 0 ? '#f57c3a' : '#b3c9e5',
                  border: index === 0 ? '1px solid #f57c3a' : '1px solid #2a4162',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f57c3a20';
                  e.target.style.borderColor = '#f57c3a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = index === 0 ? '#1a3150' : '#0b1a2f';
                  e.target.style.borderColor = index === 0 ? '#f57c3a' : '#2a4162';
                }}
              >
                {id}
              </span>
            ))}
            <button
              onClick={copyToClipboard}
              style={{
                background: 'transparent',
                border: '1px solid #f57c3a',
                color: '#f57c3a',
                padding: '0.5rem 1.2rem',
                borderRadius: '40px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f57c3a';
                e.target.style.color = '#0b1a2f';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#f57c3a';
              }}
            >
              <i className="far fa-copy"></i> Copy
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#f57c3a' }}></i>
            <p style={{ marginTop: '1rem', color: '#b3c9e5' }}>Fetching shipment details...</p>
          </div>
        )}

        {/* Tracking Result Section */}
        {showResult && shipment && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                Shipment <span style={{ color: '#f57c3a' }}>{shipment.id}</span>
              </div>
              <div className="status-badge" style={{
                background: shipment.status === 'delivered' ? '#2e6b4c' : '#f57c3a',
                color: shipment.status === 'delivered' ? '#e0f0e8' : '#0b1a2f',
                padding: '0.5rem 2rem',
                borderRadius: '40px',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                <i className={`fas ${shipment.statusIcon}`}></i> {shipment.statusText}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.8fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Left Panel - Info */}
              <div style={{
                background: '#10243e',
                borderRadius: '32px',
                padding: '2rem',
                border: '1px solid #2a4162'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#cfdefa' }}>
                  <i className="fas fa-user" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>CUSTOMER</div>
                    <div>{shipment.customer}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#cfdefa' }}>
                  <i className="fas fa-phone" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>PHONE</div>
                    <div>{shipment.phone}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#cfdefa' }}>
                  <i className="fas fa-location-dot" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>DELIVERY ADDRESS</div>
                    <div>{shipment.address}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#cfdefa' }}>
                  <i className="fas fa-truck" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>DRIVER</div>
                    <div>{shipment.driver}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#cfdefa' }}>
                  <i className="fas fa-clock" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>ETA</div>
                    <div>{shipment.eta}</div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <div style={{ color: '#f57c3a', marginBottom: '1rem' }}>DELIVERY PROGRESS</div>
                  <div className="progress-steps">
                    {renderProgressSteps(shipment)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2rem', color: '#cfdefa' }}>
                  <i className="fas fa-note-sticky" style={{ color: '#f57c3a', width: '24px' }}></i>
                  <div>
                    <div style={{ color: '#f57c3a', fontSize: '0.9rem' }}>DELIVERY NOTES</div>
                    <div>"{shipment.notes}"</div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Map */}
              <div style={{
                background: '#0e2037',
                borderRadius: '32px',
                overflow: 'hidden',
                border: '1px solid #2a4162'
              }}>
                <div ref={mapRef} id="trackingMap" style={{ width: '100%', height: '400px', background: '#1a2f48' }}></div>
                
                <div style={{
                  padding: '1rem',
                  display: 'flex',
                  gap: '2rem',
                  background: '#102842',
                  borderTop: '1px solid #f57c3a40',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', marginRight: '5px', background: '#f57c3a', border: '2px solid #ffb27a' }}></span>
                    Delivery location
                  </span>
                  <span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', marginRight: '5px', background: '#3b9eff', border: '2px solid #9aceff' }}></span>
                    Current driver position
                  </span>
                  <span style={{
                    background: '#1f3450',
                    padding: '0.3rem 1rem',
                    borderRadius: '40px',
                    fontSize: '0.9rem',
                    border: '1px solid #f57c3a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginLeft: 'auto'
                  }}>
                    <i className="fas fa-route"></i> <span>{calculateDistance(shipment.driverPos, shipment.deliveryPos)} km</span>
                  </span>
                </div>

                <div style={{
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  background: '#0e2037',
                  borderTop: '1px solid #f57c3a40',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={handleFitBounds}
                    style={{
                      background: '#1f3450',
                      border: '1px solid #f57c3a',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: '0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f57c3a';
                      e.target.style.color = '#0b1a2f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#1f3450';
                      e.target.style.color = 'white';
                    }}
                  >
                    <i className="fas fa-expand-arrows-alt"></i> Show both
                  </button>
                  <button
                    onClick={handleCenterDriver}
                    style={{
                      background: '#1f3450',
                      border: '1px solid #f57c3a',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: '0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f57c3a';
                      e.target.style.color = '#0b1a2f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#1f3450';
                      e.target.style.color = 'white';
                    }}
                  >
                    <i className="fas fa-truck"></i> Center driver
                  </button>
                  <button
                    onClick={handleCenterDelivery}
                    style={{
                      background: '#1f3450',
                      border: '1px solid #f57c3a',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: '0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f57c3a';
                      e.target.style.color = '#0b1a2f';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#1f3450';
                      e.target.style.color = 'white';
                    }}
                  >
                    <i className="fas fa-map-pin"></i> Center delivery
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backend Explanation */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: '#0a1c30',
          borderRadius: '60px',
          borderLeft: '5px solid #f57c3a',
          fontSize: '0.9rem',
          color: '#b1cdf5',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          border: '1px solid #2c4769'
        }}>

        </div>
      </div>

      {/* Toast Notification */}
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
          zIndex: 1000,
          border: '2px solid #ffc59b',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CustomerTrackingResult;