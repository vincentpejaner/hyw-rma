import { useState } from "react";
import AuthMenu from "./auth-menu.jsx";
import logo from "./images/logo1.png";
import "./site-header.css";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="page-header">
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((current) => !current)}
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
        <AuthMenu />
      </div>
    </header>
  );
}
