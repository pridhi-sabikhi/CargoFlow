import React, { useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState("This Month");

  const stats = {
    totalSales: "₹983,410",
    totalOrders: "58,375",
    totalVisitors: "237,782",
  };

  const statsChanges = {
    sales: "+3.36%",
    orders: "-2.89%",
    visitors: "+8.02%",
  };

  const topCategories = [
    { name: "Electronics", value: "₹3,400,000", color: "#3b82f6", percentage: 45 },
    { name: "Fashion", value: "₹1,200,000", color: "#10b981", percentage: 25 },
    { name: "Home & Kitchen", value: "₹595,000", color: "#f59e0b", percentage: 15 },
    { name: "Beauty & Personal Care", value: "₹575,000", color: "#8b5cf6", percentage: 10 },
    { name: "Sports & Outdoors", value: "₹550,000", color: "#ef4444", percentage: 5 },
  ];

  const revenueData = [32000, 28000, 35000, 30000, 38000, 42000, 45000, 40000, 38000, 42000, 48000, 52000];
  const orderData = [28000, 25000, 32000, 28000, 35000, 38000, 40000, 36000, 34000, 38000, 42000, 45000];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const recentOrders = [
    { no: 1, orderId: "#10254", customer: "Amaya Weller", product: "Wireless Headphones", qty: 2, date: "12-Aug", status: "Shipped", amount: "₹100" },
    { no: 2, orderId: "#10255", customer: "Sebastian Adams", product: "Running Shoes", qty: 1, date: "12-Aug", status: "Processing", amount: "₹75" },
    { no: 3, orderId: "#10256", customer: "Suzanne Bright", product: "Smartwatch", qty: 1, date: "12-Aug", status: "Shipped", amount: "₹150" },
    { no: 4, orderId: "#10257", customer: "Peter Howl", product: "Coffee Maker", qty: 1, date: "12-Aug", status: "Processing", amount: "₹60" },
    { no: 5, orderId: "#10258", customer: "Anta Singh", product: "Bluetooth Speaker", qty: 3, date: "12-Aug", status: "Shipped", amount: "₹50" },
  ];

  const recentActivity = [
    { user: "Mayreen Steel", action: "purchased 2 items totaling ₹300", type: "purchase", time: "2 min ago" },
    { action: "The price of \"Smart TV\" was updated from ₹500 to ₹450", type: "update", time: "15 min ago" },
    { user: "Whomit Laurent", action: "left a 5-star review for \"Wireless Headphones\"", type: "review", time: "1 hour ago" },
    { action: "Running Shoes stock is below 10 units", type: "alert", time: "3 hours ago" },
    { user: "Damien Ugo's", action: "order status changed from \"Pending\" to \"Processing\"", type: "status", time: "5 hours ago" },
  ];

  const trafficSources = [
    { source: "Direct Traffic", percentage: 40, color: "#3b82f6" },
    { source: "Organic Search", percentage: 30, color: "#10b981" },
    { source: "Social Media", percentage: 15, color: "#f59e0b" },
    { source: "Referral Traffic", percentage: 10, color: "#8b5cf6" },
    { source: "Email Campaigns", percentage: 5, color: "#ef4444" },
  ];

  const userLocations = [
    { country: "United States", percentage: 36, value: 366 },
    { country: "United Kingdom", percentage: 24, value: 244 },
    { country: "Indonesia", percentage: 17.5, value: 175 },
    { country: "Russia", percentage: 15, value: 150 },
    { country: "Others", percentage: 7.5, value: 75 },
  ];

  // Calculate donut chart segments
  const donutSegments = [];
  let cumulativePercentage = 0;
  trafficSources.forEach(source => {
    donutSegments.push({
      ...source,
      start: cumulativePercentage,
      end: cumulativePercentage + source.percentage
    });
    cumulativePercentage += source.percentage;
  });

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">CargoFlow</h1>
        </div>
        <div className="header-right">
          <select 
            className="date-filter" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">{stats.totalSales}</div>
            <div className={`stat-change ${statsChanges.sales.includes('+') ? 'positive' : 'negative'}`}>
              {statsChanges.sales} <span className="stat-period">vs last week</span>
            </div>
          </div>
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <path d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"/>
            </svg>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className={`stat-change ${statsChanges.orders.includes('+') ? 'positive' : 'negative'}`}>
              {statsChanges.orders} <span className="stat-period">vs last week</span>
            </div>
          </div>
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Visitors</div>
            <div className="stat-value">{stats.totalVisitors}</div>
            <div className={`stat-change ${statsChanges.visitors.includes('+') ? 'positive' : 'negative'}`}>
              {statsChanges.visitors} <span className="stat-period">vs last week</span>
            </div>
          </div>
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 20v-2a6 6 0 0 1 12 0v2" />
            </svg>
          </div>
        </div>
      </div>

      {/* MAIN GRID - TOP SECTION */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN - Categories with Bar Chart */}
        <div className="left-column">
          <div className="chart-card">
            <h3>Top Categories</h3>
            <div className="categories-with-bars">
              {topCategories.map((category, index) => (
                <div key={index} className="category-bar-item">
                  <div className="category-bar-info">
                    <span className="category-color" style={{ backgroundColor: category.color }}></span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-value">{category.value}</span>
                  </div>
                  <div className="category-bar-container">
                    <div 
                      className="category-bar-fill" 
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Revenue Analytics with Line Graph */}
        <div className="right-column">
          <div className="chart-card revenue-analytics">
            <div className="chart-header">
              <h3>Revenue Analytics</h3>
              <div className="revenue-values">
                <div className="revenue-item">
                  <span className="revenue-label">Revenue</span>
                  <span className="revenue-amount">₹14,521</span>
                </div>
                <div className="revenue-item">
                  <span className="revenue-label">Order</span>
                  <span className="revenue-amount">₹14,521</span>
                </div>
              </div>
            </div>
            
            {/* Line Graph */}
            <div className="line-graph">
              <div className="graph-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="grid-line horizontal" style={{ bottom: `${i * 20}%` }}></div>
                ))}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="grid-line vertical" style={{ left: `${(i + 1) * 8.33}%` }}></div>
                ))}
              </div>
              
              {/* Revenue Line */}
              <svg className="graph-line revenue-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={revenueData.map((value, index) => 
                    `${(index / (revenueData.length - 1)) * 100},${100 - (value / 60000) * 100}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Order Line */}
              <svg className="graph-line order-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={orderData.map((value, index) => 
                    `${(index / (orderData.length - 1)) * 100},${100 - (value / 60000) * 100}`
                  ).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </svg>
              
              {/* X-Axis Labels */}
              <div className="x-axis-labels">
                {months.map((month, i) => (
                  <span key={i} style={{ left: `${(i / months.length) * 100}%` }}>{month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION - Monthly Target & Progress */}
      <div className="middle-section">
        <div className="chart-card target-card">
          <div className="target-header">
            <h3>Monthly Target</h3>
            <div className="target-progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                />
                <text x="18" y="20.35" className="percentage">{85}%</text>
              </svg>
            </div>
          </div>
          
          <div className="target-progress-container">
            <div className="target-progress-bar">
              <div className="progress-fill" style={{width: '85%'}}></div>
            </div>
            <span className="forecast">+18.22% forecast month</span>
          </div>
          
          <div className="progress-message">
            <strong>Great Progress!</strong> Our achievement in improving sales, gross margin and net profit month on month
          </div>
          
          <div className="target-table">
            <div className="target-table-header">
              <span>Month</span>
              <span>Target</span>
              <span>Actual</span>
            </div>
            <div className="target-table-row">
              <span>12-Aug</span>
              <span>₹600,000</span>
              <span>₹610,000</span>
            </div>
          </div>
        </div>

        <div className="split-right">
          {/* Active Users with Bar Chart */}
          <div className="chart-card active-users">
            <div className="active-users-header">
              <h3>Active User</h3>
              <span className="user-count">2,758</span>
              <span className="user-change positive">+6.02% from last month</span>
            </div>
            
            <div className="locations-with-bars">
              {userLocations.map((location, index) => (
                <div key={index} className="location-bar-item">
                  <div className="location-info">
                    <span className="country">{location.country}</span>
                    <span className="value">{location.value}</span>
                  </div>
                  <div className="location-bar-container">
                    <div 
                      className="location-bar-fill" 
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                    <span className="location-percentage">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Rate with Mini Donut */}
          <div className="chart-card conversion-rate">
            <h3>Conversion Rate</h3>
            <div className="conversion-donut">
              <svg viewBox="0 0 36 36" className="circular-chart small">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="68, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="conversion-items">
                <div className="conversion-item">
                  <span className="conversion-label">Product</span>
                  <span className="conversion-value">₹25,000</span>
                </div>
                <div className="conversion-item">
                  <span className="conversion-label">Sales</span>
                  <span className="conversion-value">₹16,000</span>
                </div>
                <div className="conversion-item">
                  <span className="conversion-label">Gross Margin</span>
                  <span className="conversion-value">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-section">
        {/* Traffic Sources with Donut Chart */}
        <div className="chart-card traffic-sources">
          <h3>Traffic Sources</h3>
          <div className="traffic-donut-container">
            <svg viewBox="0 0 36 36" className="circular-chart traffic-donut">
              {donutSegments.map((segment, index) => {
                const startAngle = (segment.start / 100) * 360;
                const endAngle = (segment.end / 100) * 360;
                const start = polarToCartesian(18, 18, 15.9155, startAngle);
                const end = polarToCartesian(18, 18, 15.9155, endAngle);
                const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                
                const d = [
                  "M", start.x, start.y,
                  "A", 15.9155, 15.9155, 0, largeArcFlag, 1, end.x, end.y
                ].join(" ");
                
                return (
                  <path
                    key={index}
                    d={d}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </div>
          
          <div className="traffic-list">
            {trafficSources.map((traffic, index) => (
              <div key={index} className="traffic-item">
                <span className="traffic-source">
                  <span className="traffic-dot" style={{ backgroundColor: traffic.color }}></span>
                  {traffic.source}
                </span>
                <span className="traffic-percentage">{traffic.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="table-card">
          <div className="table-header">
            <h3>Recent Orders</h3>
          </div>
          <div className="orders-table">
            <div className="table-header-row">
              <span>No</span>
              <span>Order ID</span>
              <span>Customer ID</span>
              <span>Product ID</span>
              <span>Qty</span>
              <span>Date</span>
              <span>Status</span>
              <span>Amount</span>
            </div>
            {recentOrders.map((order) => (
              <div key={order.orderId} className="table-row">
                <span>{order.no}</span>
                <span className="order-id">{order.orderId}</span>
                <span>{order.customer}</span>
                <span>{order.product}</span>
                <span className="quantity">{order.qty}</span>
                <span>{order.date}</span>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <span className="amount">{order.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className={`activity-item ${activity.type}`}>
                <div className="activity-time">{activity.time}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    {activity.user && <strong>{activity.user} </strong>}
                    {activity.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for donut chart
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export default AdminDashboard;