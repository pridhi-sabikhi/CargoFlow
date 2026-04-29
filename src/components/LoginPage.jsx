import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

const LoginPage = () => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [password, setPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin"); 
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 


  const validateEmail = (value) => emailRegex.test(value);
  const validatePassword = (value) => passwordRegex.test(value);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();
    const inputPassword = password;

    if (!normalizedEmail || !inputPassword) {
      setError("Please enter email and password.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: inputPassword,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));

      setInfo(`Logged in as ${data.user.role.toUpperCase()}! Redirecting...`);

      setTimeout(() => {
        switch (data.user.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "user":
            navigate("/user/dashboard");
            break;
          case "driver":
            navigate("/driver/dashboard");
            break;
          default:
            navigate("/admin/dashboard");
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const normalizedSignupEmail = signupEmail.trim().toLowerCase();

    if (!signupName || !normalizedSignupEmail || !signupPassword) {
      setError("Please fill all fields to create an account.");
      return;
    }
    if (!validateEmail(normalizedSignupEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      if (!validatePassword(signupPassword)) {
        setError(
          "Password must have: 12+ chars, 1 uppercase, 1 digit, 1 special char."
        );
        return;
      }

      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: normalizedSignupEmail,
          password: signupPassword,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Sign up failed.");
      }

      setInfo("Account created successfully! You can now sign in.");
      setMode("signin");

      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setEmail(normalizedSignupEmail);
    } catch (err) {
      setError(err.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email first to reset password.");
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to start password reset.");
      }

      setInfo(data.message || "If this email is registered, reset link has been sent.");
    } catch (err) {
      setError(err.message || "Unable to start password reset.");
    } finally {
      setLoading(false);
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
                End Logistics Management
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
            Â© {new Date().getFullYear()} CargoFlow
          </div>
        </div>

    
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
                    className={`role-button ${selectedRole === 'user' ? 'role-button-active' : ''}`}
                    onClick={() => setSelectedRole('user')}
                  >
                    User
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
                {loading ? "Please wait..." : "Sign in"}
              </button>

              <div className="role-hint">
                Login as Admin / User / Driver
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

              <div className="role-selector">
                <label className="form-label">Register as:</label>
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
                    className={`role-button ${selectedRole === 'user' ? 'role-button-active' : ''}`}
                    onClick={() => setSelectedRole('user')}
                  >
                    User
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
                {loading ? "Please wait..." : "Sign up"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
