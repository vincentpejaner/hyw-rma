import "./track.css";
import { useState, useEffect } from "react";
import logo from "./images/logo1.png";
import About from "./about";
import Login from "./login.jsx";
import Submit from "./submit.jsx";

const API_BASE = "http://192.168.254.130:3001";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rma, setRma] = useState(null);

  const handleSearch = async () => {
    const ticket = query.trim();

    if (!ticket) {
      setErrorMsg("Please enter a Ticket ID.");
      setRma(null);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        `${API_BASE}/api/hyw/track/${encodeURIComponent(ticket)}`
      );

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch RMA details.");
      }

      setRma(data);
    } catch (err) {
      setRma(null);
      setErrorMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setErrorMsg("");
    setRma(null);
  };

  const SearchCard = () => (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Enter Ticket ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />

      <button className="search-button" onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {(rma || errorMsg) && (
        <button className="clear-button" onClick={handleClear} disabled={loading}>
          Clear
        </button>
      )}
    </div>
  );

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

      {/* Track Page */}
      <div className={`track-wrapper ${rma ? "has-result" : ""}`}>
        {/* NO RESULT: Left text content + Right search card */}
        {!rma && (
          <div className="track-hero">
            <div className="track-left">
              <h1>Track Your RMA</h1>
              <p className="track-sub">
                Stay informed every step of the way. Enter your Ticket ID to view your
                current status, service progress, and the details we recorded for your
                request—securely and in real time.
              </p>

              <div className="track-points">
                <div className="track-point">
                  <div className="track-point-title">Fast status checks</div>
                  <div className="track-point-sub">See updates instantly using your Ticket ID.</div>
                </div>
                <div className="track-point">
                  <div className="track-point-title">Clear summary view</div>
                  <div className="track-point-sub">Review customer and product details in one place.</div>
                </div>
                <div className="track-point">
                  <div className="track-point-title">Secure and traceable</div>
                  <div className="track-point-sub">Each request is tracked using a unique ticket number.</div>
                </div>
              </div>
            </div>

            <div className="track-right">
              <SearchCard />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* WITH RESULT: Search on left + Summary on right */}
        {rma && (
          <>
            <div className="content">
              <SearchCard />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>

            <div className="track-result">
              <div className="summary-card">
                <div className="summary-header">
                  <div>
                    <h2>RMA Summary</h2>
                    <p className="summary-sub">
                      Ticket ID: <span className="mono">{rma.ticketNumber}</span>
                    </p>
                  </div>

                  <span className="status-pill">{rma.status || "Submitted"}</span>
                </div>

                <section className="summary-section">
                  <h3>Customer Information</h3>
                  <div className="summary-grid">
                    <div className="summary-field">
                      <div className="label">Full Name</div>
                      <div className="value">{rma.fullName || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Email</div>
                      <div className="value">{rma.emailAddress || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Phone Number</div>
                      <div className="value">{rma.phoneNumber || "-"}</div>
                    </div>
                  </div>
                </section>

                <section className="summary-section">
                  <h3>Product Information</h3>
                  <div className="summary-grid">
                    <div className="summary-field">
                      <div className="label">Product Name / Model</div>
                      <div className="value">{rma.productModel || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Serial Number</div>
                      <div className="value">{rma.serialNumber || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Purchase Date</div>
                      <div className="value">{rma.purchaseDate || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Issue Type</div>
                      <div className="value">{rma.issueType || "-"}</div>
                    </div>

                    <div className="summary-field">
                      <div className="label">Preferred Resolution</div>
                      <div className="value">{rma.preferredResolution || "-"}</div>
                    </div>

                    <div className="summary-field full">
                      <div className="label">Issue Description</div>
                      <div className="value">{rma.issueDescription || "-"}</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
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

  return <Home />;
}
