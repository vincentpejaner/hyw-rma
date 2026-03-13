import { useEffect, useState } from "react";
import AuthMenu from "./auth-menu.jsx";
import logoLight from "./images/logo1.png";
import logoDark from "./images/logo2.png";
import "./site-header.css";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains("dark-mode"),
  );

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="page-header site-header">
      <button
        className="sh-menu-toggle"
        onClick={() => setMenuOpen((current) => !current)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="sh-content">
        <nav className="sh-nav sh-nav-left sh-desktop-nav">
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#submit" onClick={() => setMenuOpen(false)}>
            Submit RMA
          </a>
        </nav>

        <div className="sh-logo">
          <img src={isDarkMode ? logoDark : logoLight} alt="HYW Logo" />
        </div>

        <nav className="sh-nav sh-nav-right sh-desktop-nav">
          <a href="#track" onClick={() => setMenuOpen(false)}>
            Track RMA
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About Us
          </a>
        </nav>
      </div>

      <nav className={`sh-nav sh-nav-mobile ${menuOpen ? "active" : ""}`}>
        <a href="#home" onClick={() => setMenuOpen(false)}>
          Home
        </a>
        <a href="#submit" onClick={() => setMenuOpen(false)}>
          Submit RMA
        </a>
        <a href="#track" onClick={() => setMenuOpen(false)}>
          Track RMA
        </a>
        <a href="#about" onClick={() => setMenuOpen(false)}>
          About Us
        </a>
      </nav>

      <div className="sh-actions">
        <AuthMenu />
      </div>
    </header>
  );
}
