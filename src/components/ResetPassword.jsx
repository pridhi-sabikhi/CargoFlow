import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./LoginPage.css";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!token) {
      setError("Reset token is missing. Open the link from your email again.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setError("Password must have 12+ chars, 1 uppercase, 1 digit, and 1 special char.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to reset password.");
      }

      setInfo("Password updated successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/"), 1400);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-shell" style={{ gridTemplateColumns: "1fr" }}>
        <div className="login-main" style={{ alignItems: "center", justifyContent: "center" }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-main-title">Reset your password</h2>
            <p className="login-main-subtitle">
              Enter your new password to continue.
            </p>

            <label className="form-label">
              New Password
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="form-label">
              Confirm Password
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {error && <div className="error-message">{error}</div>}
            {info && <div className="info-message">{info}</div>}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Please wait..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
