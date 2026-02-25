// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

const LoginPage = () => {
  const [mode, setMode] = useState("signin");
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [password, setPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin"); // ✅ NEW: Role selection
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate(); // ✅ For navigation

  // Load users from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem("cargoflow_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    localStorage.setItem("cargoflow_users", JSON.stringify(users));
  }, [users]);

  const validateEmail = (value) => emailRegex.test(value);
  const validatePassword = (value) => passwordRegex.test(value);

  const handleSignIn = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must have: 12+ chars, 1 uppercase, 1 digit, 1 special char."
      );
      return;
    }

    // Check if user exists and password matches
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    // ✅ ADD ROLE & STORE IN LOCALSTORAGE
    const userWithRole = { ...user, role: selectedRole };
    localStorage.setItem("current_user", JSON.stringify(userWithRole));
    
    console.log("Login successful:", userWithRole);
    setInfo(`Logged in as ${selectedRole.toUpperCase()}! Redirecting...`);
    
    // ✅ REDIRECT TO ROLE-BASED DASHBOARD
    setTimeout(() => {
      switch(selectedRole) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'manager':
          navigate("/manager/dashboard");
          break;
        case 'driver':
          navigate("/driver/dashboard");
          break;
        default:
          navigate("/admin/dashboard");
      }
    }, 1500);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!signupName || !signupEmail || !signupPassword) {
      setError("Please fill all fields to create an account.");
      return;
    }
    if (!validateEmail(signupEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    // ✅ CHECK FOR DUPLICATE EMAIL IN LOCALSTORAGE
    if (users.find((user) => user.email === signupEmail)) {
      setError("Account with this email already exists. Please sign in instead.");
      return;
    }
    
    if (!validatePassword(signupPassword)) {
      setError(
        "Password must have: 12+ chars, 1 uppercase, 1 digit, 1 special char."
      );
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      createdAt: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    setInfo("Account created successfully! You can now sign in.");
    setMode("signin");
    
    // Clear form
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  };

  const handleForgotPassword = () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Enter your email first to reset password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check if email exists
    const user = users.find((user) => user.email === email);
    if (user) {
      setInfo("Password reset link sent to your email.");
    } else {
      setInfo("If this email is registered, reset link has been sent.");
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg viewBox="0 0 24 24" className="eye-icon" aria-hidden="true">
      {visible ? (
        <path
          d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12 5c-2.2 0-4.26.57-6.06 1.58L4.1 4.74 2.69 6.15l2 2A13.4 13.4 0 0 0 1 12c1.73 3.89 6 7 11 7 1.61 0 3.16-.3 4.59-.85l2.12 2.12 1.41-1.41-16-16L3.7 4.7 5.94 6.94C7.5 6.36 9.2 6 11 6c3.93 0 7.24 2.02 9 5-.6 1.08-1.42 2.06-2.39 2.87l-1.45-1.45A6 6 0 0 0 12 7a5.96 5.96 0 0 0-2.32.47l1.61 1.61A4 4 0 0 1 16 12c0 .53-.1 1.05-.29 1.53l1.57 1.57C18.58 14.1 19.41 13.1 20 12c-1.76-2.98-5.07-5-9-5z"
          fill="currentColor"
        />
      )}
    </svg>
  );

  return (
    <div className="login-page-wrapper">
      <div className="login-card-shell">
        {/* Left sidebar - unchanged */}
        <div className="login-sidebar">
          <div className="login-sidebar-top">
            <div className="login-logo-circle">CF</div>
            <div>
              <h1 className="login-brand-name">CargoFlow</h1>
              <p className="login-brand-tag">
                End‑to‑End Logistics Management
              </p>
            </div>
          </div>

          <div className="login-sidebar-main">
            <h2 className="login-sidebar-heading">Control your supply chain.</h2>
            <p className="login-sidebar-text">
              Track shipments in real time, manage warehouse stock, and
              streamline deliveries from one dashboard.
            </p>

            <div className="login-sidebar-stats">
              <div className="login-stat">
                <span className="login-stat-label">Active Shipments</span>
                <span className="login-stat-value">56</span>
              </div>
              <div className="login-stat">
                <span className="login-stat-label">Managed Warehouses</span>
                <span className="login-stat-value">12</span>
              </div>
            </div>
          </div>

          <div className="login-sidebar-footer">
            © {new Date().getFullYear()} CargoFlow
          </div>
        </div>

        {/* Right main */}
        <div className="login-main">
          <div className="login-toggle-bar">
            <button
              type="button"
              className={
                "toggle-tab" + (mode === "signin" ? " toggle-tab-active" : "")
              }
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={
                "toggle-tab" + (mode === "signup" ? " toggle-tab-active" : "")
              }
              onClick={() => {
                setMode("signup");
                setError("");
                setInfo("");
              }}
            >
              Sign up
            </button>
          </div>

          {mode === "signin" ? (
            <form className="login-form" onSubmit={handleSignIn}>
              <h2 className="login-main-title">Welcome back</h2>
              <p className="login-main-subtitle">
                Login to access your logistics dashboard.
              </p>

              <label className="form-label">
                Email
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@cargoflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="form-label">
                Password
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input password-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </label>

              <ul className="password-rules">
                <li>At least 12 characters</li>
                <li>At least 1 uppercase letter (A-Z)</li>
                <li>At least 1 digit (0-9)</li>
                <li>At least 1 special symbol (@#$% etc.)</li>
              </ul>
              <div className="email-rules">
                Email must contain one "@" and some letters before it.
              </div>

              <button
                type="button"
                className="text-link"
                onClick={handleForgotPassword}
              >
                Forgot your password?
              </button>

              {/* ✅ ROLE SELECTION BUTTONS */}
              <div className="role-selector">
                <label className="form-label">Login as:</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-button ${selectedRole === 'admin' ? 'role-button-active' : ''}`}
                    onClick={() => setSelectedRole('admin')}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    className={`role-button ${selectedRole === 'manager' ? 'role-button-active' : ''}`}
                    onClick={() => setSelectedRole('manager')}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    className={`role-button ${selectedRole === 'driver' ? 'role-button-active' : ''}`}
                    onClick={() => setSelectedRole('driver')}
                  >
                    Driver
                  </button>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {info && <div className="info-message">{info}</div>}

              <button type="submit" className="primary-button">
                Sign in
              </button>

              <div className="role-hint">
                Login as Admin / Warehouse Manager / Driver
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSignUp}>
              <h2 className="login-main-title">Create account</h2>
              <p className="login-main-subtitle">
                Use your work email to register for CargoFlow.
              </p>

              <label className="form-label">
                Name
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </label>

              <label className="form-label">
                Email
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </label>

              <label className="form-label">
                Password
                <div className="password-input-wrapper">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    className="form-input password-input"
                    placeholder="Create a strong password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowSignupPassword((v) => !v)}
                  >
                    <EyeIcon visible={showSignupPassword} />
                  </button>
                </div>
              </label>

              <ul className="password-rules">
                <li>At least 12 characters</li>
                <li>At least 1 uppercase letter (A-Z)</li>
                <li>At least 1 digit (0-9)</li>
                <li>At least 1 special symbol (@#$% etc.)</li>
              </ul>
              <div className="email-rules">
                Email must contain one "@" and some letters before it.
              </div>

              {error && <div className="error-message">{error}</div>}
              {info && <div className="info-message">{info}</div>}

              <button type="submit" className="primary-button">
                Sign up
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
