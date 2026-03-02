import "./home.css";
import { useState, useEffect } from "react";
import logo from "./images/logo1.png";
import About from "./about";
import Login from "./login.jsx";
import Submit from "./submit.jsx";
import Track from "./track.jsx";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="site-container">
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
            <a href="#home" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="#submit" onClick={() => setMenuOpen(false)}>
              Submit RMA
            </a>
          </nav>

          <div className="header-logo">
            <img src={logo} alt="HYW Logo" />
          </div>

          <nav className={`header-nav header-nav-right ${menuOpen ? "active" : ""}`}>
            <a href="#track" onClick={() => setMenuOpen(false)}>
              Track RMA
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About Us
            </a>
          </nav>
        </div>

        <div className="header-actions">
          <a className="header-login" href="#login">
            Log In
          </a>
        </div>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-badge">HYW • RMA Management</div>

            <h1>Fast, traceable RMA requests — from submission to resolution.</h1>
            <p>
              Submit your return or warranty request online and track progress using your
              Ticket ID. Clear status updates, organized details, and a better experience
              for both clients and technicians.
            </p>

            <div className="hero-cta">
              <a href="#submit" className="btn primary">
                Submit RMA
              </a>
              <a href="#track" className="btn">
                Track RMA
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-title">One Ticket ID</div>
                <div className="stat-sub">Everything is traceable in one place.</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Clear Summary</div>
                <div className="stat-sub">Customer + product details shown instantly.</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Faster Handling</div>
                <div className="stat-sub">Less back-and-forth, more action.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HYW</h3>
            <p>HYW RMA Management System - Your trusted return and warranty solution.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#rma">RMA Services</a>
              </li>
              <li>
                <a href="#support">Support</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>
              Email: <a href="mailto:support@hyw.com">support@hyw.com</a>
            </p>
            <p>
              Phone: <a href="tel:+1234567890">+1 (234) 567-890</a>
            </p>
            <p>Address: 123 HYW Street, City, Country</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <ul>
              <li>
                <a href="#facebook">Facebook</a>
              </li>
              <li>
                <a href="#twitter">Twitter</a>
              </li>
              <li>
                <a href="#linkedin">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HYW Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() =>
    (window.location.hash || "#home").replace("#", "")
  );

  useEffect(() => {
    const onHash = () => setPage((window.location.hash || "#home").replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "about") return <About />;
  if (page === "login") return <Login />;
  if (page === "submit") return <Submit />;
  if (page === "track") return <Track />;

  return <Home />;
}
