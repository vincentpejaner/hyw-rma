import "./login.css";
import { useState, useEffect } from "react";
import logo from "./images/logo1.png";
import About from "./about";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        console.log("Login successful:", { email });
        onLoginSuccess(email);
        setLoading(false);
      } else {
        setError("Invalid credentials");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="login-container">
      <header className="page-header">
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="header-content">
          <nav className={`header-nav header-nav-left ${menuOpen ? "active" : ""}`}>
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#submit" onClick={() => setMenuOpen(false)}>Submit RMA</a>
          </nav>
          <div className="header-logo">
            <img src={logo} alt="HYW Logo" />
          </div>
          <nav className={`header-nav header-nav-right ${menuOpen ? "active" : ""}`}>
            <a href="#track" onClick={() => setMenuOpen(false)}>Track RMA</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About Us</a>
          </nav>
        </div>
      </header>
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <img src={logo} alt="HYW Logo" />
          </div>
          <div className="login-header">
            <h1>Log In</h1>
            <p>HYW RMA System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <a href="#forgot">Forgot password?</a>
          </div>
        </div>

        <footer className="page-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>HYW</h3>
              <p>HYW RMA Management System - Your trusted return and warranty solution.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#rma">RMA Services</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: <a href="mailto:support@hyw.com">support@hyw.com</a></p>
              <p>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
              <p>Address: 123 HYW Street, City, Country</p>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <ul>
                <li><a href="#facebook">Facebook</a></li>
                <li><a href="#twitter">Twitter</a></li>
                <li><a href="#linkedin">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 HYW Inc. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() => (window.location.hash || "#home").replace("#", ""));

  useEffect(() => {
    const onHash = () => setPage((window.location.hash || "#home").replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "about") {
    return <About />;
  }

  return <Login />;
}
