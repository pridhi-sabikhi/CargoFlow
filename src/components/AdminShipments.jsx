import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Filter, PackageCheck, PlusCircle, Search, Truck } from "lucide-react";
import "./AdminShipments.css";

const PAGE_SIZE = 5;
const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "In Transit", "Delivered"];
const CATEGORY_OPTIONS = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Other"];
const REFERRAL_OPTIONS = ["Direct", "Organic Search", "Social Media", "Referral", "Email", "Ads", "Other"];

const blankForm = () => ({
  userName: "",
  address: "",
  country: "India",
  referralSource: "Direct",
  productName: "",
  category: "Electronics",
  quantity: 1,
  amount: 0,
  status: "Pending",
  orderDate: new Date().toISOString().slice(0, 10)
});

const normalize = (value) => String(value || "").toLowerCase();

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminShipments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30 days");
  const [currentPage, setCurrentPage] = useState(1);
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blankForm());


  const loadShipments = async () => {
    try {
      setLoadingShipments(true);
      setLoadError("");
      const res = await fetch("/api/dashboard/shipments");
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || `Shipments request failed with status ${res.status}`);
      }
      const data = await res.json();
      setShipments(data);
      setFilteredShipments(data);
    } catch (error) {
      setShipments([]);
      setFilteredShipments([]);
      setLoadError(error.message || "Failed to load live shipments from the database.");
    } finally {
      setLoadingShipments(false);

    }
  };

  useEffect(() => {
    loadShipments();
    const refresh = () => loadShipments();
    window.addEventListener("shipments:changed", refresh);
    window.addEventListener("shipments:created", refresh);
    return () => {
      window.removeEventListener("shipments:changed", refresh);
      window.removeEventListener("shipments:created", refresh);
    };
  }, []);

  useEffect(() => {
    let filtered = [...shipments];

    if (searchQuery) {
      const q = normalize(searchQuery);
      filtered = filtered.filter((shipment) =>
        [
          shipment.shipmentId,
          shipment.customerId,
          shipment.userName,
          shipment.productName,
          shipment.category,
          shipment.state,
          shipment.referralSource,
          shipment.status
        ].some((field) => normalize(field).includes(q))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((shipment) => normalize(shipment.status) === normalize(statusFilter));
    }

    if (dateRange !== "all") {
      const today = new Date();
      const filterDate = new Date();
      const days = dateRange === "7 days" ? 7 : dateRange === "30 days" ? 30 : 90;
      filterDate.setDate(today.getDate() - days);
      filtered = filtered.filter((shipment) => {
        const rawDate = shipment.orderDate || shipment.createdAt;
        const date = new Date(rawDate);
        return !Number.isNaN(date.getTime()) && date >= filterDate;
      });
    }

    setFilteredShipments(filtered);
    setCurrentPage(1);
  }, [shipments, searchQuery, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentShipments = filteredShipments.slice(startIndex, startIndex + PAGE_SIZE);

  const stats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === "In Transit").length,
    pending: shipments.filter((s) => s.status === "Pending").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length
  }), [shipments]);

  const getStatusColor = (status) => {
    const colors = {
      Delivered: { bg: "#e8f5e9", text: "#2e7d32", icon: <PackageCheck size={14} /> },
      "In Transit": { bg: "#e3f2fd", text: "#1565c0", icon: <Truck size={14} /> },
      Pending: { bg: "#fff3e0", text: "#ef6c00", icon: <Clock size={14} /> },
      Processing: { bg: "#fef9c3", text: "#a16207", icon: <Clock size={14} /> },
      Shipped: { bg: "#dbeafe", text: "#1d4ed8", icon: <Truck size={14} /> }
    };
    return colors[status] || { bg: "#f5f5f5", text: "#616161", icon: null };
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "amount" ? Number(value) : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await fetch("/api/dashboard/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || `Create failed (${res.status})`);
      }
      setForm(blankForm());
      setShowCreate(false);
      window.dispatchEvent(new CustomEvent("shipments:created"));
      window.dispatchEvent(new CustomEvent("shipments:changed"));
    } catch (error) {
      alert(`Failed to create shipment: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = async (shipmentId, nextStatus) => {
    try {
      const res = await fetch(`/api/dashboard/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || `Status update failed (${res.status})`);
      }
      window.dispatchEvent(new CustomEvent("shipments:created"));
      window.dispatchEvent(new CustomEvent("shipments:changed"));
      loadShipments();
    } catch (error) {
      alert(`Failed to update status: ${error.message}`);
    }
  };

  return (
    <div className="shipments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Manage and track all shipments across your fleet</p>
        </div>
        <button className="create-button" onClick={() => setShowCreate(true)}>
          <PlusCircle size={18} />
          Create Shipment
        </button>
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Shipment</h2>
              <button className="modal-close" type="button" onClick={() => setShowCreate(false)}>×</button>
            </div>

            <form className="create-form" onSubmit={handleCreate}>
              <div className="form-grid">
                <label>
                  User name
                  <input name="userName" value={form.userName} onChange={handleChange} required />
                </label>
                <label>
                  Product name
                  <input name="productName" value={form.productName} onChange={handleChange} required />
                </label>
                <label>
                  Address
                  <textarea name="address" value={form.address} onChange={handleChange} required rows="3" />
                </label>
                <label>
                  Category
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Referral source
                  <select name="referralSource" value={form.referralSource} onChange={handleChange}>
                    {REFERRAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Quantity
                  <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
                </label>
                <label>
                  Amount
                  <input name="amount" type="number" min="0" value={form.amount} onChange={handleChange} />
                </label>
                <label>
                  Country
                  <input name="country" value={form.country} onChange={handleChange} />
                </label>
                <label>
                  Order date
                  <input name="orderDate" type="date" value={form.orderDate} onChange={handleChange} />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="create-button" disabled={creating}>
                  {creating ? "Creating..." : "Create Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon total"><PackageCheck size={20} /></div><div className="stat-content"><span className="stat-label">Total Shipments</span><span className="stat-value">{stats.total}</span><span className="stat-trend positive">Live from DB</span></div></div>
        <div className="stat-card"><div className="stat-icon transit"><Truck size={20} /></div><div className="stat-content"><span className="stat-label">In Transit</span><span className="stat-value">{stats.inTransit}</span><span className="stat-trend">Live from DB</span></div></div>
        <div className="stat-card"><div className="stat-icon pending"><Clock size={20} /></div><div className="stat-content"><span className="stat-label">Pending</span><span className="stat-value">{stats.pending}</span><span className="stat-trend warning">Live from DB</span></div></div>
        <div className="stat-card"><div className="stat-icon delivered"><PackageCheck size={20} /></div><div className="stat-content"><span className="stat-label">Delivered</span><span className="stat-value">{stats.delivered}</span><span className="stat-trend positive">Live from DB</span></div></div>
      </div>

      <div className="filters-bar">
        <div className="filters-left">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID, customer, product, state, or referral..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-dropdown">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="Delivered">Delivered</option>
              <option value="In Transit">In Transit</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <Calendar size={16} />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="filters-right">
          <span className="results-count">
            Showing {filteredShipments.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredShipments.length)} of {filteredShipments.length} shipments
          </span>
        </div>
      </div>

      {loadingShipments && <div className="load-warning">Loading live shipments from MongoDB...</div>}
      {loadError && <div className="load-warning">{loadError}</div>}

      <div className="table-card">
        <div className="table-container">
          <table className="shipments-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Customer ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Referral</th>
                <th>State</th>
                <th>Created</th>
                <th>Amount</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {currentShipments.length > 0 ? currentShipments.map((shipment) => {
                const statusStyle = getStatusColor(shipment.status);
                return (
                  <tr key={shipment.shipmentId} className="shipment-row">
                    <td><span className="shipment-id">{shipment.shipmentId}</span></td>
                    <td><span className="customer-id">{shipment.customerId}</span></td>
                    <td><div className="customer-info"><span className="customer-name">{shipment.userName}</span></div></td>
                    <td><span className="shipment-type">{shipment.productName}</span></td>
                    <td><span className="shipment-type">{shipment.category}</span></td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                        {statusStyle.icon}
                        {shipment.status}
                      </span>
                    </td>
                    <td><span className="shipment-type">{shipment.referralSource || "-"}</span></td>
                    <td><span className="shipment-type">{shipment.state || "-"}</span></td>
                    <td>
                      <span className="date">{formatDate(shipment.orderDate || shipment.createdAt)}</span>
                    </td>
                    <td><span className="weight">₹{Number(shipment.amount || 0).toLocaleString("en-IN")}</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={shipment.status}
                        onChange={(e) => handleStatusUpdate(shipment.shipmentId, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="11" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                    No shipments found in the database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredShipments.length > 0 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <div className="pagination-pages">
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            <button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}