import { useEffect, useRef, useState } from "react";
import AuthMenu from "./auth-menu.jsx";
import logoLight from "./images/logo1.png";
import logoDark from "./images/logo2.png";
import "./site-header.css";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(() => !window.navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains("dark-mode"),
  );
  const wasOfflineRef = useRef(!window.navigator.onLine);
  const restoreTimerRef = useRef(null);

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

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (wasOfflineRef.current) {
        setShowRestored(true);
        clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = window.setTimeout(() => {
          setShowRestored(false);
        }, 3000);
      }
      wasOfflineRef.current = false;
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
      wasOfflineRef.current = true;
      clearTimeout(restoreTimerRef.current);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(restoreTimerRef.current);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="network-popup network-popup-offline" role="alert">
          <strong>No internet connection.</strong> Some actions are unavailable.
        </div>
      )}
      {!isOffline && showRestored && (
        <div className="network-popup network-popup-online" role="status" aria-live="polite">
          Internet connection restored.
        </div>
      )}
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
    </>
  );
}
