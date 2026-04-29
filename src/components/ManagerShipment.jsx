// ManagerShipment.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FaTruck, 
  FaBox, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaMapMarkerAlt,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaFilter,
  FaSearch,
  FaChartLine,
  FaDownload,
  FaPrint,
  FaEye,
  FaRoute,
  FaWarehouse,
  FaShoppingCart,
  FaUsers,
  FaCalendarAlt,
  FaBell,
  FaChartBar,
  FaTachometerAlt,
  FaClipboardList,
  FaBoxes,
  FaUserClock
} from 'react-icons/fa';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ManagerShipment = () => {
  const navigate = useNavigate();
  
  // State
  const [dateRange, setDateRange] = useState('Today');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', isSuccess: true });
  const [mapView, setMapView] = useState('all'); // 'all', 'driver', 'shipment'
  
  // Map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Sample data - In real app, this would come from API
  const [shipments] = useState([
    { 
      id: 'SH-482', status: 'IN PROGRESS', priority: 'High',
      customer: 'Rahul Sharma', address: 'Bandra West, Mumbai, Maharashtra',
      driver: 'Raj Patel', driverPhone: '+91 98765 43210',
      eta: '10:45 AM', progress: 75, type: 'Express', value: '₹4,500', items: 3,
      lat: 19.0596, lng: 72.8295, driverLat: 19.0760, driverLng: 72.8777
    },
    { 
      id: 'SH-483', status: 'PENDING', priority: 'Medium',
      customer: 'Priya Singh', address: 'Connaught Place, New Delhi',
      driver: 'Unassigned', driverPhone: '-',
      eta: '2:30 PM', progress: 0, type: 'Standard', value: '₹2,300', items: 1,
      lat: 28.6315, lng: 77.2167, driverLat: null, driverLng: null
    },
    { 
      id: 'SH-484', status: 'DELIVERED', priority: 'Low',
      customer: 'Amit Kumar', address: 'Koramangala, Bangalore, Karnataka',
      driver: 'Suresh Reddy', driverPhone: '+91 98765 55678',
      eta: 'Delivered', progress: 100, type: 'Standard', value: '₹8,900', items: 5,
      lat: 12.9352, lng: 77.6245, driverLat: 12.9352, driverLng: 77.6245
    },
    { 
      id: 'SH-485', status: 'DELAYED', priority: 'High',
      customer: 'Neha Gupta', address: 'Salt Lake, Kolkata, West Bengal',
      driver: 'Vikram Das', driverPhone: '+91 98765 99012',
      eta: 'Delayed', progress: 45, type: 'Express', value: '₹12,000', items: 8,
      lat: 22.5726, lng: 88.3639, driverLat: 22.5500, driverLng: 88.3400
    },
    { 
      id: 'SH-486', status: 'IN PROGRESS', priority: 'Medium',
      customer: 'Arjun Mehta', address: 'Dadar, Mumbai, Maharashtra',
      driver: 'Deepak Joshi', driverPhone: '+91 98765 33456',
      eta: '11:15 AM', progress: 60, type: 'Standard', value: '₹6,750', items: 4,
      lat: 19.0178, lng: 72.8478, driverLat: 19.0400, driverLng: 72.8600
    },
  ]);

  const [drivers] = useState([
    { id: 1, name: 'Raj Patel',    status: 'On Delivery', activeShipments: 2, rating: 4.8, phone: '+91 98765 43210', lat: 19.0760, lng: 72.8777 },
    { id: 2, name: 'Suresh Reddy', status: 'Available',   activeShipments: 0, rating: 4.9, phone: '+91 98765 55678', lat: 28.6139, lng: 77.2090 },
    { id: 3, name: 'Vikram Das',   status: 'On Delivery', activeShipments: 1, rating: 4.7, phone: '+91 98765 99012', lat: 22.5726, lng: 88.3639 },
    { id: 4, name: 'Deepak Joshi', status: 'Break',       activeShipments: 1, rating: 4.6, phone: '+91 98765 33456', lat: 19.0178, lng: 72.8478 },
    { id: 5, name: 'Anita Sharma', status: 'Available',   activeShipments: 0, rating: 4.9, phone: '+91 98765 77890', lat: 12.9716, lng: 77.5946 },
  ]);

  // Stats
  const stats = [
    { label: 'Active Shipments', value: '24', change: '+3', icon: <FaTruck />, color: '#3b9eff' },
    { label: 'Total Drivers', value: '12', change: '0', icon: <FaUsers />, color: '#10b981' },
    { label: 'On-Time Rate', value: '94%', change: '+2%', icon: <FaClock />, color: '#f59e0b' },
    { label: 'Delayed', value: '3', change: '-1', icon: <FaExclamationTriangle />, color: '#ef4444' },
  ];

  // Show toast
  const showToast = (message, isSuccess = true) => {
    setToast({ show: true, message, isSuccess });
    setTimeout(() => setToast({ show: false, message: '', isSuccess: true }), 3000);
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const map = mapInstanceRef.current;

    if (mapView === 'all' || mapView === 'shipment') {
      // Add shipment markers
      shipments.forEach(shipment => {
        if (shipment.lat && shipment.lng) {
          const color = 
            shipment.status === 'DELIVERED' ? '#10b981' :
            shipment.status === 'IN PROGRESS' ? '#3b9eff' :
            shipment.status === 'DELAYED' ? '#ef4444' : '#f59e0b';

          const icon = L.divIcon({
            html: `<div style="position:relative;">
              <div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0b1a2f; box-shadow: 0 0 0 2px ${color}80;"></div>
              <i class="fas fa-box" style="position:absolute; top:4px; left:4px; color:white; font-size:10px;"></i>
            </div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const marker = L.marker([shipment.lat, shipment.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 5px;">
                <strong style="color: #f57c3a;">${shipment.id}</strong><br>
                Customer: ${shipment.customer}<br>
                Status: ${shipment.status}<br>
                Driver: ${shipment.driver}<br>
                <button onclick="window.selectShipment('${shipment.id}')" style="background: #f57c3a; color: #0b1a2f; border: none; padding: 5px 10px; border-radius: 20px; margin-top: 5px; cursor: pointer; width: 100%;">
                  View Details
                </button>
              </div>
            `);

          markersRef.current.push(marker);
        }
      });
    }

    if (mapView === 'all' || mapView === 'driver') {
      // Add driver markers
      drivers.forEach(driver => {
        if (driver.lat && driver.lng) {
          const color = 
            driver.status === 'On Delivery' ? '#3b9eff' :
            driver.status === 'Available' ? '#10b981' : '#f59e0b';

          const icon = L.divIcon({
            html: `<div style="position:relative;">
              <div style="background: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #0b1a2f; box-shadow: 0 0 0 2px ${color}80;"></div>
              <i class="fas fa-truck" style="position:absolute; top:5px; left:5px; color:white; font-size:10px;"></i>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([driver.lat, driver.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 5px;">
                <strong style="color: #3b9eff;">${driver.name}</strong><br>
                Status: ${driver.status}<br>
                Active Shipments: ${driver.activeShipments}<br>
                Rating: ⭐ ${driver.rating}<br>
                <button onclick="window.callDriver('${driver.phone}')" style="background: #3b9eff; color: #0b1a2f; border: none; padding: 5px 10px; border-radius: 20px; margin-top: 5px; cursor: pointer; width: 100%;">
                  Call Driver
                </button>
              </div>
            `);

          markersRef.current.push(marker);
        }
      });
    }

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [shipments, drivers, mapView]);

  // Filter shipments based on selected filters
  const filteredShipments = shipments.filter(shipment => {
    if (selectedStatus !== 'all' && shipment.status !== selectedStatus) return false;
    if (selectedDriver !== 'all' && shipment.driver !== selectedDriver && 
        !(selectedDriver === 'unassigned' && shipment.driver === 'Unassigned')) return false;
    if (searchTerm && !shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !shipment.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Get unique drivers for filter
  const driverOptions = ['all', 'unassigned', ...new Set(shipments.map(s => s.driver).filter(d => d !== 'Unassigned'))];

  // Status counts
  const statusCounts = {
    all: shipments.length,
    'IN PROGRESS': shipments.filter(s => s.status === 'IN PROGRESS').length,
    'PENDING': shipments.filter(s => s.status === 'PENDING').length,
    'DELIVERED': shipments.filter(s => s.status === 'DELIVERED').length,
    'DELAYED': shipments.filter(s => s.status === 'DELAYED').length,
  };

  const ff = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

  // Expose functions to window for popup buttons
  useEffect(() => {
    window.selectShipment = (id) => {
      setSelectedShipment(id);
      showToast(`Selected shipment: ${id}`);
    };
    window.callDriver = (phone) => {
      showToast(`Calling ${phone}...`);
    };

    return () => {
      delete window.selectShipment;
      delete window.callDriver;
    };
  }, []);

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
        .dot-progress { background: #3b9eff; border: 2px solid #a3ceff; }
        .dot-delivered { background: #10b981; border: 2px solid #a7f3d0; }
        .dot-delayed { background: #ef4444; border: 2px solid #fecaca; }
        .dot-pending { background: #f59e0b; border: 2px solid #fed7aa; }
        .dot-driver { background: #8b5cf6; border: 2px solid #c4b5fd; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }
        .status-progress { background: #3b9eff20; color: #3b9eff; border: 1px solid #3b9eff; }
        .status-delivered { background: #10b98120; color: #10b981; border: 1px solid #10b981; }
        .status-delayed { background: #ef444420; color: #ef4444; border: 1px solid #ef4444; }
        .status-pending { background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b; }
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }
        .table-row:hover {
          background: #1f3450;
          cursor: pointer;
        }
      `}</style>

      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
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
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              color: '#3b9eff',
              background: '#1f3450',
              padding: '0.3rem 1.8rem',
              borderRadius: '60px',
              border: '1px solid #3b9eff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaTachometerAlt /> Fleet Manager
            </div>
            <div style={{
              background: '#1f3450',
              color: '#eef3fc',
              padding: '0.5rem 1.5rem',
              borderRadius: '40px',
              fontWeight: 500,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #3b9eff60'
            }}>
              <FaCalendarAlt style={{ color: '#3b9eff' }} /> {dateRange}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: '#1f3a5a',
                border: '1px solid #3b9eff60',
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
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => showToast('Report downloaded')}
              style={{
                background: '#1f3a5a',
                border: '1px solid #3b9eff60',
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
              <FaDownload /> Export
            </button>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#3b9eff,#8b5cf6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #3b9eff80'
            }}>
              M
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: '#10243e',
              borderRadius: '24px',
              border: '1px solid #2a4162',
              padding: '1.5rem',
              boxShadow: '0 10px 20px #00000040',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ color: '#b3c9e5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{stat.value}</p>
                <p style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                  {stat.change} vs yesterday
                </p>
              </div>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '15px',
                background: `${stat.color}20`,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{
            background: '#10243e',
            borderRadius: '24px',
            border: '1px solid #2a4162',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{ color: '#b3c9e5', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                <FaSearch style={{ marginRight: '5px' }} /> Search
              </label>
              <input
                type="text"
                placeholder="Shipment ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#1d334f',
                  border: '1px solid #3f5a7c',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#b3c9e5', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                <FaFilter style={{ marginRight: '5px' }} /> Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#1d334f',
                  border: '1px solid #3f5a7c',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="IN PROGRESS">In Progress ({statusCounts['IN PROGRESS']})</option>
                <option value="PENDING">Pending ({statusCounts['PENDING']})</option>
                <option value="DELIVERED">Delivered ({statusCounts['DELIVERED']})</option>
                <option value="DELAYED">Delayed ({statusCounts['DELAYED']})</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#b3c9e5', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                <FaUserTie style={{ marginRight: '5px' }} /> Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#1d334f',
                  border: '1px solid #3f5a7c',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">All Drivers</option>
                <option value="unassigned">Unassigned</option>
                {driverOptions.filter(d => d !== 'all' && d !== 'unassigned').map(driver => (
                  <option key={driver} value={driver}>{driver}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: '#b3c9e5', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                <FaMapMarkerAlt style={{ marginRight: '5px' }} /> Map View
              </label>
              <select
                value={mapView}
                onChange={(e) => setMapView(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#1d334f',
                  border: '1px solid #3f5a7c',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="all">Show All</option>
                <option value="shipment">Show Shipments Only</option>
                <option value="driver">Show Drivers Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Map Section */}
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
              borderBottom: '2px solid #3b9eff40',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500, color: '#b3c9e5' }}>
                <FaMapMarkerAlt style={{ color: '#3b9eff', marginRight: '5px' }} /> Fleet Tracking
              </span>
              <div>
                <span className="legend-dot dot-progress"></span> In Progress
                <span style={{ marginLeft: '15px' }} className="legend-dot dot-delivered"></span> Delivered
                <span style={{ marginLeft: '15px' }} className="legend-dot dot-delayed"></span> Delayed
                <span style={{ marginLeft: '15px' }} className="legend-dot dot-pending"></span> Pending
                <span style={{ marginLeft: '15px' }} className="legend-dot dot-driver"></span> Driver
              </div>
            </div>
            
            <div ref={mapRef} id="fleetMap" style={{ width: '100%', height: '400px', background: '#1a2f48' }}></div>
            
            <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid #2a4162' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b9eff' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#b3c9e5' }}>{shipments.filter(s => s.status === 'IN PROGRESS').length} Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#b3c9e5' }}>{shipments.filter(s => s.status === 'DELIVERED').length} Delivered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#b3c9e5' }}>{drivers.length} Drivers</span>
                </div>
              </div>
              <button
                onClick={() => setMapView(mapView === 'all' ? 'driver' : 'all')}
                style={{
                  marginLeft: 'auto',
                  background: '#1f3a5a',
                  border: '1px solid #3b9eff60',
                  color: '#f2e5d7',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <FaEye /> {mapView === 'all' ? 'Show Drivers' : 'Show All'}
              </button>
            </div>
          </div>

          {/* Drivers List */}
          <div style={{
            background: '#10243e',
            borderRadius: '32px',
            border: '1px solid #2a4162',
            padding: '1.5rem',
            boxShadow: '0 15px 30px #00000060'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaUsers style={{ color: '#3b9eff' }} /> Active Drivers
              </h3>
              <span style={{ background: '#1f3450', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
                {drivers.filter(d => d.status === 'On Delivery').length} on delivery
              </span>
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {drivers.map(driver => (
                <div
                  key={driver.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: '1px solid #2a4162',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                  className="table-row"
                  onClick={() => showToast(`Selected driver: ${driver.name}`)}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: driver.status === 'On Delivery' ? '#3b9eff20' : 
                               driver.status === 'Available' ? '#10b98120' : '#f59e0b20',
                    color: driver.status === 'On Delivery' ? '#3b9eff' : 
                           driver.status === 'Available' ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    <FaUserTie />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{driver.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#b3c9e5' }}>⭐ {driver.rating}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{
                        color: driver.status === 'On Delivery' ? '#3b9eff' : 
                               driver.status === 'Available' ? '#10b981' : '#f59e0b'
                      }}>
                        {driver.status}
                      </span>
                      <span style={{ color: '#b3c9e5' }}>{driver.activeShipments} shipments</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`Calling ${driver.name}...`);
                    }}
                    style={{
                      background: '#1f3a5a',
                      border: '1px solid #3b9eff60',
                      color: '#3b9eff',
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FaPhone />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('Opening dispatch center')}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.8rem',
                background: '#1f3a5a',
                border: '1px solid #3b9eff60',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FaRoute /> Dispatch Center
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div style={{
          background: '#10243e',
          borderRadius: '32px',
          border: '1px solid #2a4162',
          padding: '1.5rem',
          boxShadow: '0 15px 30px #00000060'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaClipboardList style={{ color: '#3b9eff' }} /> Active Shipments ({filteredShipments.length})
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => showToast('Refreshing data...')}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #3b9eff60',
                  color: '#f2e5d7',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <FaChartLine /> Refresh
              </button>
              <button
                onClick={() => showToast('Printing...')}
                style={{
                  background: '#1f3a5a',
                  border: '1px solid #3b9eff60',
                  color: '#f2e5d7',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <FaPrint /> Print
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2a4162' }}>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Shipment ID</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Customer</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Priority</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Driver</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>ETA</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Progress</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Value</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'left', color: '#b3c9e5', fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment, index) => (
                  <tr
                    key={index}
                    className="table-row"
                    style={{ borderBottom: '1px solid #2a4162' }}
                    onClick={() => {
                      setSelectedShipment(shipment.id);
                      navigate(`/shipment/${shipment.id}`);
                    }}
                  >
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#3b9eff' }}>{shipment.id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div>
                        <div>{shipment.customer}</div>
                        <div style={{ fontSize: '0.8rem', color: '#b3c9e5' }}>{shipment.items} items</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`status-badge status-${shipment.status.toLowerCase().replace(' ', '')}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`priority-${shipment.priority.toLowerCase()}`}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div>
                        <div>{shipment.driver}</div>
                        {shipment.driver !== 'Unassigned' && (
                          <div style={{ fontSize: '0.8rem', color: '#b3c9e5' }}>{shipment.driverPhone}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>{shipment.eta}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          background: '#1d334f',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${shipment.progress}%`,
                            height: '100%',
                            background: shipment.status === 'DELIVERED' ? '#10b981' :
                                       shipment.status === 'DELAYED' ? '#ef4444' : '#3b9eff',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{shipment.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{shipment.value}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/shipment/${shipment.id}`);
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #3b9eff60',
                            color: '#3b9eff',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Contacting driver for ${shipment.id}`);
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #10b98160',
                            color: '#10b981',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '15px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaPhone />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Section */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: '#0a1c30',
          borderRadius: '60px',
          borderLeft: '5px solid #ef4444',
          fontSize: '0.9rem',
          color: '#b1cdf5',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          border: '1px solid #2c4769'
        }}>
          <FaBell style={{ color: '#ef4444', fontSize: '1.2rem' }} />
          <span>
            <strong style={{ color: '#ef4444' }}>3 Alerts:</strong> SH-485 delayed due to traffic · Driver Raj Patel needs assistance · Low fuel warning for Truck #4
          </span>
          <button
            onClick={() => showToast('Viewing all alerts')}
            style={{
              marginLeft: 'auto',
              background: '#1f3a5a',
              border: '1px solid #ef444460',
              color: '#ef4444',
              padding: '0.3rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            View All
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: toast.isSuccess ? '#3b9eff' : '#ef4444',
          color: '#fff',
          padding: '1rem 2rem',
          borderRadius: '60px',
          fontWeight: 600,
          boxShadow: '0 10px 25px #3b9eff80',
          zIndex: 999,
          border: '2px solid #9aceff',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ManagerShipment;