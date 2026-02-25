// src/components/Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} CargoFlow. All rights reserved.</span>
        <span className="footer-links">
          <button type="button" className="footer-link-btn">
            Privacy
          </button>
          <button type="button" className="footer-link-btn">
            Terms
          </button>
          <button type="button" className="footer-link-btn">
            Support
          </button>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
