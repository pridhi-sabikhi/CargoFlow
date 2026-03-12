// src/App.jsx
import React from "react";
import 'leaflet/dist/leaflet.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import AdminShipments from "./components/AdminShipments";
import DriverShipment from "./components/DriverShipment";
import DriverDashboard from "./components/DriverDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import ManagerShipment from "./components/ManagerShipment";
import Tracking from "./components/Tracking";
import Invoices from "./components/INVOICES";
import ShippingLabel from "./components/ShippingLabel";
import CustomerTrackingResult from "./components/CustomerTrackingResult ";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/manager/dashboard" element={<ManagerDashboard />} />
  <Route path="/driver/dashboard" element={<DriverDashboard />} />

<Route path="/admin/shipments" element={<AdminShipments/>} />

  <Route path="/driver/shipments" element={<DriverShipment />} />
  <Route path="/driver/shipments/:id" element={<DriverShipment />} />
  <Route path="/manager/shipments" element={<ManagerShipment />} />
  <Route path="/tracking" element={<Tracking />} />
  <Route path="/invoices" element={<Invoices />} />
  <Route path="/shipping-label" element={<ShippingLabel />} />
  <Route path="/customer-tracking" element={<CustomerTrackingResult />} />
  <Route path="/customer-tracking/:id" element={<CustomerTrackingResult />} />
  
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
