import { useEffect, useState } from "react";
import "./my-rma.css";
import "./submit.css";
import AuthMenu from "./auth-menu.jsx";
import logo from "./images/logo1.png";

const API_BASE = "http://192.168.254.130:3001";

function getStoredAccount() {
  try {
    const rawAccount = window.localStorage.getItem("account");
    return rawAccount ? JSON.parse(rawAccount) : null;
  } catch {
    return null;
  }
}

export default function MyRma() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const account = getStoredAccount();
  const accountEmail = account?.account_email || account?.account_username || "";

  useEffect(() => {
    if (!accountEmail) {
      window.location.hash = "#login";
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/api/hyw/mine/${encodeURIComponent(accountEmail)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch your RMA requests.");
        }

        setRequests(data.requests || []);
      } catch (err) {
        setError(err.message || "Failed to fetch your RMA requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [accountEmail]);

  if (!accountEmail) {
    return null;
  }

  return (
    <div className="my-rma-page">
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
          <AuthMenu />
        </div>
      </header>

      <main className="my-rma-main">
        <section className="my-rma-hero">
          <h1>My RMA Requests</h1>
          <p>View all RMA requests submitted using your signed-in account.</p>
        </section>

        {loading && <div className="my-rma-state">Loading your RMA requests...</div>}

        {!loading && error && <div className="my-rma-state">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="my-rma-state">No RMA requests found for this account yet.</div>
        )}

        {!loading && !error && requests.length > 0 && (
          <section className="my-rma-list">
            {requests.map((request) => (
              <article className="my-rma-card" key={request.ticketNumber}>
                <div className="my-rma-card-header">
                  <div>
                    <h2>{request.productModel || "Unnamed Product"}</h2>
                    <p className="my-rma-ticket">Ticket ID: {request.ticketNumber}</p>
                  </div>
                  <span className="my-rma-status">{request.status || "Submitted"}</span>
                </div>

                <div className="my-rma-grid">
                  <div className="my-rma-field">
                    <div className="my-rma-label">Issue Type</div>
                    <div className="my-rma-value">{request.issueType || "-"}</div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Preferred Resolution</div>
                    <div className="my-rma-value">{request.preferredResolution || "-"}</div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Serial Number</div>
                    <div className="my-rma-value">{request.serialNumber || "-"}</div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Purchase Date</div>
                    <div className="my-rma-value">{request.purchaseDate || "-"}</div>
                  </div>

                  <div className="my-rma-field full">
                    <div className="my-rma-label">Issue Description</div>
                    <div className="my-rma-value">{request.issueDescription || "-"}</div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
