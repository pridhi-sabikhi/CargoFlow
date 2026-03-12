import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const Tracking = () => {
  const navigate = useNavigate();
  // Initial shipment data
  const [shipments, setShipments] = useState([
    { id: 'SH-382', status: 'in-transit', warehouse: 'North hub', driver: 'J. Miller', lastUpdate: '2 min ago', lat: 40.78, lng: -73.97 },
    { id: 'DEMO-1', status: 'in-transit', warehouse: 'East dock', driver: 'A. Chen', lastUpdate: 'just now', lat: 40.75, lng: -74.01 },
    { id: 'SH-921', status: 'delivered', warehouse: 'South depot', driver: 'M. Voss', lastUpdate: '1 hour ago', lat: 40.71, lng: -74.00 },
    { id: 'SH-544', status: 'pending', warehouse: 'North hub', driver: 'J. Miller', lastUpdate: '3 hours ago', lat: 40.73, lng: -73.93 },
    { id: 'SH-238', status: 'exception', warehouse: 'East dock', driver: 'R. Zhao', lastUpdate: '35 min ago', lat: 40.69, lng: -73.88 },
    { id: 'SH-105', status: 'in-transit', warehouse: 'South depot', driver: 'M. Voss', lastUpdate: '15 min ago', lat: 40.77, lng: -73.86 },
    { id: 'SH-678', status: 'pending', warehouse: 'North hub', driver: 'A. Chen', lastUpdate: '1 day ago', lat: 40.80, lng: -73.94 }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    warehouse: 'all',
    driver: 'all',
    search: ''
  });

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const cardElementsRef = useRef([]);
  const mapInitializedRef = useRef(false);

  // Filter shipments based on current filters
  const filteredShipments = shipments.filter(shipment => {
    if (filters.status !== 'all' && shipment.status !== filters.status) return false;
    if (filters.warehouse !== 'all' && shipment.warehouse !== filters.warehouse) return false;
    if (filters.driver !== 'all' && shipment.driver !== filters.driver) return false;
    if (filters.search && !shipment.id.toUpperCase().includes(filters.search.toUpperCase())) return false;
    return true;
  });

  // Custom icon based on status
  const getIconForStatus = (status) => {
    let color = '#f5a342'; // orange transit
    if (status === 'delivered') color = '#3cb371';
    else if (status === 'pending') color = '#b0b8c5';
    else if (status === 'exception') color = '#dc5b5b';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #0e1f35; box-shadow: 0 0 0 2px #f57c3a;"></div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapInitializedRef.current) {
      // Initialize map
      const map = L.map('map').setView([40.75, -73.95], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, CartoDB dark',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      mapRef.current = map;
      mapInitializedRef.current = true;
    }
  }, []);

  // Clear all markers from map
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
      markersRef.current = [];
    }
  }, []);

  // Update map markers and UI
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const listContainer = document.getElementById('shipmentList');
    if (!listContainer) return;

    // Clear existing cards and markers
    listContainer.innerHTML = '';
    clearMarkers();
    cardElementsRef.current = [];

    if (filteredShipments.length === 0) {
      // Show empty state
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.innerHTML = `
        <i class="fas fa-box-open"></i>
        <p>No shipments match your filters</p>
        <small style="color: #7e9bc0; cursor: pointer;" onclick="window.resetFilters && window.resetFilters()">Reset filters</small>
      `;
      listContainer.appendChild(emptyDiv);
      return;
    }

    // Create cards and markers for filtered shipments
    filteredShipments.forEach((s) => {
      // Create card
      const card = document.createElement('div');
      card.className = `shipment-card ${s.status}`;
      card.dataset.id = s.id;
      card.innerHTML = `
        <div class="card-info">
          <h4><i class="fas fa-box" style="color:#f57c3a; margin-right:6px;"></i>${s.id}</h4>
          <div class="status"><i class="fas fa-circle"></i> ${s.status.replace('-',' ')}</div>
          <div class="time"><i class="far fa-clock"></i> ${s.lastUpdate}</div>
          <div style="font-size: 0.7rem; color: #a4bbd6; margin-top: 4px;">
            <i class="fas fa-warehouse"></i> ${s.warehouse}
          </div>
        </div>
        <div class="driver-badge">
          <i class="fas fa-user"></i> ${s.driver}
        </div>
      `;
      listContainer.appendChild(card);
      cardElementsRef.current.push(card);

      // Create marker
      const icon = getIconForStatus(s.status);
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <b style="color:#0b1a2f;">${s.id}</b><br>
        <span style="color:#f57c3a;">${s.status}</span> · ${s.driver}<br>
        <small>${s.warehouse} · last: ${s.lastUpdate}</small>
      `);
      marker.shipmentId = s.id;
      markersRef.current.push(marker);

      // Card click handler
      card.addEventListener('click', () => {
        map.setView([s.lat, s.lng], 15);
        marker.openPopup();
        card.style.backgroundColor = '#2b4d72';
        setTimeout(() => card.style.backgroundColor = '', 300);
      });
    });

    // Fit map bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [filteredShipments, clearMarkers]);

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      warehouse: 'all',
      driver: 'all',
      search: ''
    });
    
    // Update input elements
    const statusFilter = document.getElementById('statusFilter');
    const warehouseFilter = document.getElementById('warehouseFilter');
    const driverFilter = document.getElementById('driverFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) statusFilter.value = 'all';
    if (warehouseFilter) warehouseFilter.value = 'all';
    if (driverFilter) driverFilter.value = 'all';
    if (searchInput) searchInput.value = '';
  };

  // Make resetFilters available globally
  useEffect(() => {
    window.resetFilters = resetFilters;
    return () => {
      delete window.resetFilters;
    };
  }, []);

  // Handle search
  const handleSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      setFilters(prev => ({ ...prev, search: searchInput.value.trim() }));
    }
  };

  // Handle refresh - randomize lastUpdate times
  const handleRefresh = () => {
    const updates = ['now', '1 min ago', '3 min ago', 'just now', '12 min ago', '30 sec ago'];
    setShipments(prev => prev.map(s => ({
      ...s,
      lastUpdate: updates[Math.floor(Math.random() * updates.length)]
    })));
  };

  // Handle demo movement - move DEMO-1
  const handleDemoMove = () => {
    setShipments(prev => prev.map(s => {
      if (s.id === 'DEMO-1') {
        return {
          ...s,
          lat: s.lat + 0.002,
          lng: s.lng + 0.0015,
          lastUpdate: '30 sec ago'
        };
      }
      return s;
    }));

    // Highlight the demo shipment card
    setTimeout(() => {
      const demoIndex = shipments.findIndex(s => s.id === 'DEMO-1');
      if (demoIndex >= 0 && cardElementsRef.current[demoIndex]) {
        cardElementsRef.current[demoIndex].style.backgroundColor = '#2b4d72';
        setTimeout(() => {
          if (cardElementsRef.current[demoIndex]) {
            cardElementsRef.current[demoIndex].style.backgroundColor = '';
          }
        }, 700);
      }
    }, 100);
  };

  return (
    <div style={{ 
      background: '#0b1a2f',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Bar */}
      <div style={{
        background: '#0e1f35',
        padding: '0.9rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1.5rem',
        borderBottom: '2px solid #f57c3a',
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        {/* Logo */}
        <div className="logo-area">
          <h2 style={{
            color: '#f57c3a',
            fontWeight: 600,
            letterSpacing: '0.5px',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <i className="fas fa-truck-fast" style={{
              background: '#f57c3a',
              color: '#0b1a2f',
              padding: '8px',
              borderRadius: '50%',
              fontSize: '1rem'
            }}></i>
            LogiTrack
          </h2>
          <button
            onClick={() => navigate('/customer-tracking')}
            style={{
              background: '#f57c3a',
              color: '#0b1a2f',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            Customer Tracking
          </button>
        </div>

        {/* Search Box */}
        <div style={{
          flex: 2,
          minWidth: '260px',
          display: 'flex',
          background: '#1f2e48',
          borderRadius: '40px',
          alignItems: 'center',
          padding: '0.3rem 0.3rem 0.3rem 1.2rem',
          border: '1px solid #2e405e',
          transition: '0.2s'
        }}>
          <i className="fas fa-search" style={{ color: '#f5b48b', fontSize: '1rem' }}></i>
          <input
            type="text"
            id="searchInput"
            placeholder="Search by shipment ID (e.g. SH-382, DEMO-1)"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.7rem 0.8rem',
              width: '100%',
              color: '#f0e6da',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: '#f57c3a',
              borderRadius: '40px',
              padding: '0.5rem 1.5rem',
              color: '#0b1a2f',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: 'auto',
              border: '1px solid #f57c3a'
            }}
          >
            <i className="fas fa-arrow-right"></i> Track
          </button>
        </div>

        {/* Filter Group */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-badge" style={{
            background: '#1f2e48',
            borderRadius: '30px',
            padding: '0.4rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#d8e2f0',
            fontSize: '0.9rem',
            border: '1px solid #314a6b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <i className="fas fa-circle-check" style={{ color: '#f57c3a', fontSize: '0.8rem' }}></i>
            <select
              id="statusFilter"
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f0e6da',
                outline: 'none',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="all">All statuses</option>
              <option value="in-transit">In transit</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="exception">Exception</option>
            </select>
          </div>

          <div className="filter-badge" style={{
            background: '#1f2e48',
            borderRadius: '30px',
            padding: '0.4rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#d8e2f0',
            fontSize: '0.9rem',
            border: '1px solid #314a6b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <i className="fas fa-warehouse" style={{ color: '#f57c3a', fontSize: '0.8rem' }}></i>
            <select
              id="warehouseFilter"
              onChange={(e) => handleFilterChange('warehouse', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f0e6da',
                outline: 'none',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="all">All warehouses</option>
              <option value="North hub">North hub</option>
              <option value="East dock">East dock</option>
              <option value="South depot">South depot</option>
            </select>
          </div>

          <div className="filter-badge" style={{
            background: '#1f2e48',
            borderRadius: '30px',
            padding: '0.4rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#d8e2f0',
            fontSize: '0.9rem',
            border: '1px solid #314a6b',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <i className="fas fa-user" style={{ color: '#f57c3a', fontSize: '0.8rem' }}></i>
            <select
              id="driverFilter"
              onChange={(e) => handleFilterChange('driver', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f0e6da',
                outline: 'none',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="all">All drivers</option>
              <option value="J. Miller">J. Miller</option>
              <option value="A. Chen">A. Chen</option>
              <option value="M. Voss">M. Voss</option>
              <option value="R. Zhao">R. Zhao</option>
            </select>
          </div>
        </div>

        {/* Filter Stats */}
        <div id="filterStats" style={{
          background: '#1f3450',
          padding: '0.2rem 1rem',
          borderRadius: '30px',
          fontSize: '0.8rem',
          color: '#f57c3a',
          border: '1px solid #f57c3a'
        }}>
          Showing {filteredShipments.length} of {shipments.length}
        </div>

        {/* Legend Pills */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          background: '#10233e',
          padding: '0.3rem 1.5rem',
          borderRadius: '40px',
          border: '1px solid #2e405e'
        }}>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cdddf5', fontSize: '0.8rem' }}>
            <span className="dot in-transit" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#f5a342', boxShadow: '0 0 0 1px #f57c3a' }}></span> Transit
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cdddf5', fontSize: '0.8rem' }}>
            <span className="dot delivered" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#3cb371' }}></span> Delivered
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cdddf5', fontSize: '0.8rem' }}>
            <span className="dot pending" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#b0b8c5' }}></span> Pending
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cdddf5', fontSize: '0.8rem' }}>
            <span className="dot exception" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#dc5b5b' }}></span> Exception
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: '360px',
          background: '#11233b',
          borderRight: '2px solid #f57c3a',
          display: 'flex',
          flexDirection: 'column',
          color: '#edf2fa',
          boxShadow: '4px 0 12px rgba(0,0,0,0.6)',
          zIndex: 5
        }}>
          <div style={{
            padding: '1.2rem 1.2rem 0.5rem 1.2rem',
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '0.3px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px dashed #2d4b70'
          }}>
            <span style={{ color: '#f5b48b' }}>
              <i className="fas fa-clipboard-list" style={{ marginRight: '8px' }}></i>
              ACTIVE SHIPMENTS <span id="shipmentCount">({filteredShipments.length})</span>
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="refresh-btn"
                onClick={handleRefresh}
                style={{
                  background: 'transparent',
                  border: '1px solid #f57c3a',
                  color: '#f57c3a',
                  padding: '0.3rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center'
                }}
              >
                <i className="fas fa-rotate"></i> Refresh
              </button>
              <button
                className="play-demo"
                onClick={handleDemoMove}
                style={{
                  background: '#f57c3a',
                  color: '#0b1a2f',
                  borderRadius: '30px',
                  padding: '0.4rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: '1px solid #f57c3a'
                }}
              >
                <i className="fas fa-play"></i> Demo move
              </button>
            </div>
          </div>

          <div
            id="shipmentList"
            className="shipment-list"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem 0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.7rem'
            }}
          ></div>

          <div style={{
            padding: '1rem',
            fontSize: '0.7rem',
            borderTop: '1px solid #2e4a6b',
            color: '#9eb7d4',
            textAlign: 'center'
          }}>
            <i className="fas fa-location-dot" style={{ color: '#f57c3a' }}></i> Click any card to focus marker
          </div>
        </div>

        {/* Map Container */}
        <div className="map-wrapper" style={{ flex: 1, position: 'relative', background: '#152d47' }}>
          <div id="map" style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: '#0e1f35dd',
            backdropFilter: 'blur(6px)',
            padding: '0.6rem 1.5rem',
            borderRadius: '60px',
            border: '1px solid #f57c3a',
            color: 'white',
            fontSize: '0.8rem',
            zIndex: 10,
            display: 'flex',
            gap: '1.2rem',
            boxShadow: '0 4px 12px black'
          }}>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="dot in-transit" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#f5a342', boxShadow: '0 0 0 1px #f57c3a' }}></span> In transit
            </span>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="dot delivered" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#3cb371' }}></span> Delivered
            </span>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="dot pending" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#b0b8c5' }}></span> Pending
            </span>
            <span className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="dot exception" style={{ width: '12px', height: '12px', borderRadius: '20px', background: '#dc5b5b' }}></span> Exception
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        position: 'fixed',
        bottom: '6px',
        left: '16px',
        background: '#0b1a2fcc',
        padding: '4px 14px',
        borderRadius: '30px',
        borderLeft: '3px solid #f57c3a',
        fontSize: '0.7rem',
        color: '#c9dbf5',
        backdropFilter: 'blur(2px)',
        zIndex: 200
      }}>
      </div>

      {/* Global styles */}
      <style jsx>{`
        .shipment-list::-webkit-scrollbar {
          width: 6px;
        }
        .shipment-list::-webkit-scrollbar-track {
          background: #10233e;
        }
        .shipment-list::-webkit-scrollbar-thumb {
          background: #f57c3a;
          border-radius: 10px;
        }
        .filter-badge:hover {
          border-color: #f57c3a;
          background: #2a3a58;
        }
        .filter-badge select option {
          background: #0e1f35;
          color: #f0e6da;
        }
        .search-box:focus-within {
          border-color: #f57c3a;
          box-shadow: 0 0 0 2px rgba(245,124,58,0.3);
        }
        .refresh-btn:hover {
          background: #f57c3a20;
          border-color: #ff9d6b;
          color: #ffdcc0;
        }
        .play-demo:hover {
          background: #ff8f4f;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #7e9bc0;
        }
        .empty-state i {
          font-size: 2rem;
          color: #f57c3a;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        .shipment-card {
          background: #1b314b;
          border-left: 5px solid;
          border-radius: 12px;
          padding: 1rem 1.2rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          transition: 0.2s;
          cursor: pointer;
          border-left-color: #b0b8c5;
          border-right: 1px solid #2f4b70;
        }
        .shipment-card.in-transit {
          border-left-color: #f5a342;
        }
        .shipment-card.delivered {
          border-left-color: #3cb371;
        }
        .shipment-card.exception {
          border-left-color: #dc5b5b;
        }
        .shipment-card:hover {
          background: #23415f;
          transform: translateY(-2px);
          box-shadow: 0 8px 14px #00000055;
        }
        .card-info h4 {
          font-weight: 600;
          font-size: 1rem;
          color: #f2e5d7;
          margin: 0;
        }
        .card-info .status {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 4px 0 2px 0;
        }
        .status i {
          font-size: 0.6rem;
          color: #f57c3a;
        }
        .time {
          font-size: 0.7rem;
          color: #a4bbd6;
        }
        .driver-badge {
          background: #0e1f35;
          border-radius: 30px;
          padding: 0.2rem 0.8rem;
          font-size: 0.7rem;
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #f57c3a40;
        }
      `}</style>
    </div>
  );
};

export default Tracking;