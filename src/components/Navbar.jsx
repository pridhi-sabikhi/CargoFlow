// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("current_user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("current_user");
    navigate("/");
  };

  // ✅ DYNAMIC DASHBOARD BASED ON USER ROLE
  const getDashboardPath = () => {
    if (!currentUser?.role) return "/admin/dashboard";
    switch (currentUser.role) {
      case 'admin':    return "/admin/dashboard";
      case 'user':     return "/user/dashboard";
      case 'driver':   return "/driver/dashboard";
      default:         return "/admin/dashboard";
    }
  };

  // ✅ NEW: DYNAMIC SHIPMENTS PATH
  const getShipmentsPath = () => {
    switch (currentUser?.role) {
      case 'admin':
        return "/admin/shipments";
      case 'driver':
        return "/driver/shipments";
      default:
        return "/admin/shipments";
    }
  };

  const dashboardLabel =
    currentUser?.role === "user"
      ? "User Dashboard"
      : currentUser?.role
        ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`
        : "Dashboard";

  // ✅ DYNAMIC SHIPMENTS LABEL
  const shipmentsLabel = currentUser?.role 
    ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Shipments`
    : "Shipments";

  const role = currentUser?.role;

  const navItems = [
    { label: dashboardLabel, path: getDashboardPath() },
    ...(role !== "user" ? [{ label: shipmentsLabel, path: getShipmentsPath() }] : []),
    ...(role === "driver" ? [{ label: "Tracking", path: "/driver/tracking" }] : []),
    ...(role === "driver" ? [{ label: "Invoices", path: "/driver/invoices" }] : []),
    ...(role !== "user" && role !== "driver" ? [{ label: "Tracking",       path: "/tracking"       }] : []),
    ...(role !== "user" && role !== "driver" ? [{ label: "Invoices",       path: "/invoices"       }] : []),
    ...(role !== "driver"   && role !== "user" ? [{ label: "Shipping Label", path: "/shipping-label" }] : []),
    ...(role === "user" ? [{ label: "Shipping Label", path: "/user/shipping-label" }] : []),
  ];

  return (
    <header className="nav-root">
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-logo">CF</div>
          <span className="nav-title">CargoFlow</span>
        </div>

        <nav className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={"nav-link" + (location.pathname === item.path || location.pathname.startsWith(item.path + "/") ? " nav-link-active" : "")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          {currentUser ? (
            <>
              <span className="nav-role-pill">
                {currentUser.name} 
                <span className="role-badge">{currentUser.role?.toUpperCase()}</span>
              </span>
              <button className="nav-avatar-button" type="button" onClick={handleLogout}>
                <span className="nav-avatar-initials">
                  {currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </span>
              </button>
            </>
          ) : (
            <Link to="/" className="nav-login-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
