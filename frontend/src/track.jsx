import "./track.css";
import { useState, useEffect } from "react";
import About from "./about";
import Login from "./login.jsx";
import MyRma from "./my-rma.jsx";
import Submit from "./submit.jsx";
import Profile from "./profile.jsx";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

const API_BASE = "http://192.168.254.131:3001";

function SearchCard({
  query,
  setQuery,
  loading,
  rma,
  errorMsg,
  handleSearch,
  handleClear,
  disabled = false,
}) {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder={disabled ? "Please log in to search" : "Enter Ticket ID..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) handleSearch();
        }}
        disabled={disabled}
      />

      <button
        className="search-button"
        onClick={handleSearch}
        disabled={loading || disabled}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {(rma || errorMsg) && (
        <button
          className="clear-button"
          onClick={handleClear}
          disabled={loading || disabled}
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasResult = Boolean(rma && rma.ticketId);

  useEffect(() => {
    // Check if user is logged in
    const accountData = localStorage.getItem("account");
    setIsLoggedIn(!!accountData);
  }, []);

  const handleSearch = async () => {
    const ticket = query.trim();

    if (!ticket) {
      setErrorMsg("Please enter a Ticket ID.");
      setRma(null);
      return;
    }

    // Get account ID from localStorage
    const accountData = localStorage.getItem("account");
    if (!accountData) {
      setErrorMsg("Please log in to track RMAs.");
      setRma(null);
      return;
    }

    const account = JSON.parse(accountData);
    const accountId = account.account_id;

    if (!accountId) {
      setErrorMsg("Account information is invalid. Please log in again.");
      setRma(null);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/hyw/track/${ticket}?accountId=${accountId}`);

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch RMA details.");
      }

      setRma(data);
      console.log("Fetched RMA:", data);
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
 
      <div className={`track-wrapper ${hasResult ? "has-result" : ""}`}> 
        {!hasResult && (
          <div className="track-hero">
            <div className="track-left">
              <h1>Track Your RMA</h1>
              <p className="track-sub">
                Stay informed every step of the way. Enter your Ticket ID to
                view your current status, service progress, and the details we
                recorded for your request—securely and in real time.
              </p>

              {!isLoggedIn && (
                <div className="login-notice">
                  <p style={{ color: "#ff6b6b", fontWeight: "bold", marginTop: "20px" }}>
                    Please log in to track your RMAs.
                  </p>
                  <button 
                    onClick={() => window.location.hash = "#login"}
                    style={{ 
                      marginTop: "10px", 
                      padding: "10px 20px", 
                      backgroundColor: "#007bff", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "5px", 
                      cursor: "pointer" 
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              )}

              <div className="track-points">
                <div className="track-point">
                  <div className="track-point-title">Fast status checks</div>
                  <div className="track-point-sub">
                    See updates instantly using your Ticket ID.
                  </div>
                </div>
                <div className="track-point">
                  <div className="track-point-title">Clear summary view</div>
                  <div className="track-point-sub">
                    Review customer and product details in one place.
                  </div>
                </div>
                <div className="track-point">
                  <div className="track-point-title">Secure and traceable</div>
                  <div className="track-point-sub">
                    Each request is tracked using a unique ticket number.
                  </div>
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
                disabled={!isLoggedIn}
              />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* WITH RESULT: Search on left + Summary on right */}
        {hasResult && (
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
                disabled={!isLoggedIn}
              />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>

            <div className="track-result">
              <div className="summary-card track-summary-card">
                <div className="track-summary-top">
                  <h2>RMA Form Summary</h2>
                  <p className="track-summary-ticket">
                    Ticket ID:{" "}
                    <span className="mono">{rma.ticketId || "-"}</span>
                  </p>
                </div>

                <div className="track-company-block">
                  <p className="track-company-name">
                    {rma.company?.companyName || rma.company?.fullName || "-"}
                  </p>
                  <p>{rma.company?.companyAddress || "-"}</p>
                  <p>{rma.company?.companyEmail || "-"}</p>
                  <p>{rma.company?.companyPhone || "-"}</p>
                </div>

                <p className="track-summary-meta">
                  Status: {rma.status || "Submitted"}
                </p>
                <p className="track-summary-meta">
                  Total Items: {(rma.items || []).length}
                </p>

                <div className="track-table-wrapper">
                  <table className="track-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Category</th>
                        <th>Description</th>
                        <th>Serial Number</th>
                        <th>Date of Purchase</th>
                        <th>Return Date</th>
                        <th>Problem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rma.items || []).map((item) => (
                        <tr key={`track-item-${item.itemNo}`}>
                          <td>{item.itemNo}</td>
                          <td>{item.category || "-"}</td>
                          <td>{item.itemDescription || "-"}</td>
                          <td>{item.serialNumber || "-"}</td>
                          <td>{item.dateOfPurchase || "-"}</td>
                          <td>{item.returnDate || "-"}</td>
                          <td>{item.problem || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
    (window.location.hash || "#home").replace("#", ""),
  );

  useEffect(() => {
    const onHash = () =>
      setPage((window.location.hash || "#home").replace("#", ""));
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
