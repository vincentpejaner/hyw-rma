import "./track.css";
import { useState, useEffect } from "react";
import About from "./about";
import Login from "./login.jsx";
import MyRma from "./my-rma.jsx";
import Submit from "./submit.jsx";
import Profile from "./profile.jsx";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

const API_BASE = "http://192.168.254.130:3001";

function SearchCard({
  query,
  setQuery,
  loading,
  rma,
  errorMsg,
  handleSearch,
  handleClear,
}) {
  return (
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

      <button
        className="search-button"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {(rma || errorMsg) && (
        <button
          className="clear-button"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </button>
      )}
    </div>
  );
}

function Home() {

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

  

  return (
    <div className="site-container">
      <SiteHeader />

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
             <SearchCard
  query={query}
  setQuery={setQuery}
  loading={loading}
  rma={rma}
  errorMsg={errorMsg}
  handleSearch={handleSearch}
  handleClear={handleClear}
/>
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* WITH RESULT: Search on left + Summary on right */}
        {rma && (
          <>
            <div className="content">
             <SearchCard
  query={query}
  setQuery={setQuery}
  loading={loading}
  rma={rma}
  errorMsg={errorMsg}
  handleSearch={handleSearch}
  handleClear={handleClear}
/>
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

      <SiteFooter />
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
  if (page === "my-rma") return <MyRma />;
  if (page === "submit") return <Submit />;
  if (page === "profile") return <Profile />;

  return <Home />;
}
