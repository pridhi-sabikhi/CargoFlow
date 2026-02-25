// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import AdminShipments from "./components/AdminShipments";

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/manager/dashboard" element={
    <div className="dashboard-placeholder">
      <h1>Manager Dashboard</h1>
      <p>Warehouse management coming soon...</p>
    </div>
  } />
  <Route path="/driver/dashboard" element={
    <div className="dashboard-placeholder">
      <h1>Driver Dashboard</h1>
      <p>Driver app coming soon...</p>
    </div>
  }/>

<Route path="/admin/shipments" element={<AdminShipments/>} />

  <Route path="/driver/shipment" element={
    <div className="dashboard-placeholder">
      <h1>Driver Shipments</h1>
      <p>Driver app coming soon...</p>
    </div>
  }/>
  
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
