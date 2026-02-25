import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Truck,
  PackageCheck,
  Clock,
  MapPin,
  PlusCircle
} from "lucide-react";
import "./AdminShipments.css";

const AdminShipments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30 days");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredShipments, setFilteredShipments] = useState([]);
  
  const itemsPerPage = 5;

  // Shipments data with logical routes
  const shipments = [
    // Domestic India Routes (by road/rail)
    { 
      id: "#CF-1247", 
      customer: "John Smith", 
      origin: "Delhi", 
      destination: "Mumbai", 
      status: "Delivered", 
      driver: "Raj Patel", 
      date: "2026-02-20",
      weight: "45kg",
      type: "Express",
      priority: "High",
      eta: "2026-02-21",
      routeType: "Road"
    },
    { 
      id: "#CF-1246", 
      customer: "Sarah Wilson", 
      origin: "Bangalore", 
      destination: "Chennai", 
      status: "In Transit", 
      driver: "Amit Kumar", 
      date: "2026-02-22",
      weight: "32kg",
      type: "Standard",
      priority: "Medium",
      eta: "2026-02-24",
      routeType: "Road"
    },
    { 
      id: "#CF-1245", 
      customer: "Mike Johnson", 
      origin: "Pune", 
      destination: "Hyderabad", 
      status: "Pending", 
      driver: "Not Assigned", 
      date: "2026-03-15",
      weight: "67kg",
      type: "Standard",
      priority: "Low",
      eta: "2026-03-18",
      routeType: "Road"
    },
    { 
      id: "#CF-1244", 
      customer: "Priya Sharma", 
      origin: "Kolkata", 
      destination: "Guwahati", 
      status: "Delivered", 
      driver: "Raj Patel", 
      date: "2026-02-15",
      weight: "28kg",
      type: "Express",
      priority: "High",
      eta: "2026-02-17",
      routeType: "Road"
    },
    { 
      id: "#CF-1243", 
      customer: "Vikram Singh", 
      origin: "Ahmedabad", 
      destination: "Mumbai", 
      status: "In Transit", 
      driver: "Suresh Reddy", 
      date: "2026-02-21",
      weight: "55kg",
      type: "Standard",
      priority: "Medium",
      eta: "2026-02-23",
      routeType: "Road"
    },
    { 
      id: "#CF-1242", 
      customer: "Emily Brown", 
      origin: "Chennai", 
      destination: "Bangalore", 
      status: "Delivered", 
      driver: "Rahul Sharma", 
      date: "2026-02-10",
      weight: "41kg",
      type: "Express",
      priority: "High",
      eta: "2026-02-11",
      routeType: "Road"
    },
    
    // Coastal/Port Routes (by sea)
    { 
      id: "#CF-1241", 
      customer: "David Lee", 
      origin: "Mumbai Port", 
      destination: "Chennai Port", 
      status: "In Transit", 
      driver: "Coastal Shipping", 
      date: "2026-02-23",
      weight: "380kg",
      type: "Sea Freight",
      priority: "Medium",
      eta: "2026-02-28",
      routeType: "Sea"
    },
    { 
      id: "#CF-1240", 
      customer: "Lisa Chen", 
      origin: "Kandla Port", 
      destination: "Mumbai Port", 
      status: "Pending", 
      driver: "Not Assigned", 
      date: "2026-03-20",
      weight: "720kg",
      type: "Sea Freight",
      priority: "Low",
      eta: "2026-03-25",
      routeType: "Sea"
    },
    
    // International Shipping Routes (by sea)
    { 
      id: "#CF-1239", 
      customer: "Robert Wilson", 
      origin: "Singapore", 
      destination: "Mumbai Port", 
      status: "Delivered", 
      driver: "Maersk Line", 
      date: "2026-02-05",
      weight: "3300kg",
      type: "International",
      priority: "High",
      eta: "2026-02-10",
      routeType: "Sea"
    },
    { 
      id: "#CF-1238", 
      customer: "Neha Gupta", 
      origin: "Shanghai", 
      destination: "Nhava Sheva Port", 
      status: "In Transit", 
      driver: "MSC Shipping", 
      date: "2026-02-24",
      weight: "4900kg",
      type: "International",
      priority: "Medium",
      eta: "2026-03-05",
      routeType: "Sea"
    },
    { 
      id: "#CF-1237", 
      customer: "Thomas Anderson", 
      origin: "Dubai", 
      destination: "Mumbai Port", 
      status: "Pending", 
      driver: "Not Assigned", 
      date: "2026-03-25",
      weight: "6300kg",
      type: "International",
      priority: "Low",
      eta: "2026-03-30",
      routeType: "Sea"
    },
    { 
      id: "#CF-1236", 
      customer: "Pooja Mehta", 
      origin: "Colombo", 
      destination: "Chennai Port", 
      status: "Delivered", 
      driver: "Ceylon Shipping", 
      date: "2026-02-18",
      weight: "2700kg",
      type: "International",
      priority: "High",
      eta: "2026-02-20",
      routeType: "Sea"
    },
    
    // Air Freight Routes
    { 
      id: "#CF-1235", 
      customer: "Arjun Reddy", 
      origin: "Delhi Airport", 
      destination: "Singapore Changi", 
      status: "In Transit", 
      driver: "Air Cargo", 
      date: "2026-02-19",
      weight: "520kg",
      type: "Air Freight",
      priority: "High",
      eta: "2026-02-20",
      routeType: "Air"
    },
    { 
      id: "#CF-1234", 
      customer: "Meera Nair", 
      origin: "Mumbai Airport", 
      destination: "Dubai Airport", 
      status: "Delivered", 
      driver: "Emirates SkyCargo", 
      date: "2026-02-12",
      weight: "360kg",
      type: "Air Freight",
      priority: "High",
      eta: "2026-02-13",
      routeType: "Air"
    },
    { 
      id: "#CF-1233", 
      customer: "Karan Malhotra", 
      origin: "Chennai Airport", 
      destination: "Kuala Lumpur", 
      status: "Pending", 
      driver: "Not Assigned", 
      date: "2026-04-05",
      weight: "440kg",
      type: "Air Freight",
      priority: "Medium",
      eta: "2026-04-06",
      routeType: "Air"
    }
  ];

  useEffect(() => {
    setFilteredShipments(shipments);
  }, []);

  // Filter function with date range support
  useEffect(() => {
    let filtered = [...shipments];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(shipment =>
        shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(shipment => 
        shipment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Date range filter
    const today = new Date();
    const filterDate = new Date();
    
    switch(dateRange) {
      case "7 days":
        filterDate.setDate(today.getDate() - 7);
        filtered = filtered.filter(shipment => new Date(shipment.date) >= filterDate);
        break;
      case "30 days":
        filterDate.setDate(today.getDate() - 30);
        filtered = filtered.filter(shipment => new Date(shipment.date) >= filterDate);
        break;
      case "90 days":
        filterDate.setDate(today.getDate() - 90);
        filtered = filtered.filter(shipment => new Date(shipment.date) >= filterDate);
        break;
      default:
        // "all" - no filtering
        break;
    }
    
    setFilteredShipments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentShipments = filteredShipments.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    const colors = {
      "Delivered": { bg: "#e8f5e9", text: "#2e7d32", icon: <PackageCheck size={14} /> },
      "In Transit": { bg: "#e3f2fd", text: "#1565c0", icon: <Truck size={14} /> },
      "Pending": { bg: "#fff3e0", text: "#ef6c00", icon: <Clock size={14} /> },
    };
    return colors[status] || { bg: "#f5f5f5", text: "#616161", icon: null };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "High": "#ef4444",
      "Medium": "#f59e0b",
      "Low": "#10b981",
    };
    return colors[priority] || "#6b7280";
  };

  const getRouteIcon = (routeType) => {
    switch(routeType) {
      case "Sea":
        return "🚢";
      case "Air":
        return "✈️";
      default:
        return "🚛";
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === "In Transit").length,
    pending: shipments.filter(s => s.status === "Pending").length,
    delivered: shipments.filter(s => s.status === "Delivered").length
  };

  return (
    <div className="shipments-page">
      {/* Header with Create Button */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Manage and track all shipments across your fleet</p>
        </div>
        <button className="create-button">
          <PlusCircle size={18} />
          Create Shipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <PackageCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Shipments</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-trend positive">+8.3% vs last month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon transit">
            <Truck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">In Transit</span>
            <span className="stat-value">{stats.inTransit}</span>
            <span className="stat-trend">+{stats.inTransit} today</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-trend warning">+{stats.pending} new</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon delivered">
            <PackageCheck size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Delivered</span>
            <span className="stat-value">{stats.delivered}</span>
            <span className="stat-trend positive">+{stats.delivered} this week</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filters-left">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, customer, driver, or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="in transit">In Transit</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <Calendar size={16} />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="filters-right">
          <span className="results-count">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredShipments.length)} of {filteredShipments.length} shipments
          </span>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="table-card">
        <div className="table-container">
          <table className="shipments-table">
            <thead>
  <tr>
    <th>Shipment ID</th>
    <th>Customer</th>
    <th>Route</th>
    <th>Status</th>
    <th>Driver</th>
    <th>Created</th>      
    <th>Weight</th>          
    <th>Priority</th>
    
  </tr>
</thead>

            <tbody>
              {currentShipments.map((shipment) => {
                const statusStyle = getStatusColor(shipment.status);
                return (
                  <tr key={shipment.id} className="shipment-row">
                    <td>
                      <span className="shipment-id">
                        {getRouteIcon(shipment.routeType)} {shipment.id}
                      </span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{shipment.customer}</span>
                        <span className="shipment-type">{shipment.type}</span>
                      </div>
                    </td>
                    <td>
                      <div className="route-info">
                        <MapPin size={12} className="route-icon origin" />
                        <span className="route-text">{shipment.origin}</span>
                        <span className="route-arrow">→</span>
                        <MapPin size={12} className="route-icon destination" />
                        <span className="route-text">{shipment.destination}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text
                        }}
                      >
                        {statusStyle.icon}
                        {shipment.status}
                      </span>
                    </td>
                    <td>
                      <span className={shipment.driver === "Not Assigned" ? "driver-unassigned" : "driver-name"}>
                        {shipment.driver}
                      </span>
                    </td>
                    <td>
                      <span className="date">{shipment.date}</span>
                      <span className="eta">ETA: {shipment.eta}</span>
                    </td>
                    <td>
                      <span className="weight">{shipment.weight}</span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ 
                          backgroundColor: `${getPriorityColor(shipment.priority)}15`,
                          color: getPriorityColor(shipment.priority)
                        }}
                      >
                        {shipment.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredShipments.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-pages">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipments;