import "./track.css";
import { useState, useEffect } from "react";
import About from "./about";
import Login from "./login.jsx";
import MyRma from "./my-rma.jsx";
import Submit from "./submit.jsx";
import Profile from "./profile.jsx";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";
import { API_BASE } from "./api-base.js";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [productFilter, setProductFilter] = useState("");
  const hasResult = Boolean(rma && rma.ticketId);

  const filteredItems = (rma?.items || []).filter((item) => {
    const searchTerm = productFilter.toLowerCase();
    return (
      item.itemDescription?.toLowerCase().includes(searchTerm) ||
      item.serialNumber?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.problem?.toLowerCase().includes(searchTerm) ||
      item.productTicket?.toLowerCase().includes(searchTerm) ||
      item.formTicket?.toLowerCase().includes(searchTerm)
    );
  });

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

    if (!window.navigator.onLine) {
      setErrorMsg("No internet connection. Please reconnect and try again.");
      setRma(null);
      return;
    }


            
    // check for optional account information
    const accountData = localStorage.getItem("account");
    const accountId = accountData ? JSON.parse(accountData).account_id : null;

    setLoading(true);
    setErrorMsg("");

    try {
      const url = accountId
        ? `${API_BASE}/track/${ticket}?accountId=${accountId}`
        : `${API_BASE}/track/${ticket}`;
      const res = await fetch(url);

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
    setProductFilter("");
  };

  const handleProductFilterClear = () => {
    setProductFilter("");
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
                recorded for your request securely and in real time.
              </p>

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
              />
              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>

            <div className="track-result">
              <div className="summary-card track-summary-card">
                <div className="track-summary-top">
                  <h2>RMA Form Summary</h2>
                  <p className="track-summary-ticket">
                    Form Ticket ID:{" "}
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

                <div className="product-filter-section">
                  <input
                    type="text"
                    className="product-filter-input"
                    placeholder="Search by product ticket, form ticket, description, serial number, category, or problem..."
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                  />
                  {productFilter && (
                    <button
                      className="product-filter-clear"
                      onClick={handleProductFilterClear}
                    >
                      Clear Filter
                    </button>
                  )}
                  {productFilter && (
                    <p className="filter-results-count">
                      Showing {filteredItems.length} of {rma.items?.length || 0}{" "}
                      items
                    </p>
                  )}
                </div>

                <div className="track-table-wrapper">
                  <table className="track-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product Ticket</th>
                        <th>Item Category</th>
                        <th>Description</th>
                        <th>Serial Number</th>
                        <th>Date of Purchase</th>
                        <th>Return Date</th>
                        <th>Problem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                          <tr key={`track-item-${item.itemNo}`}>
                            <td>{item.itemNo}</td>
                            <td>{item.productTicket || "-"}</td>
                            <td>{item.category || "-"}</td>
                            <td>{item.itemDescription || "-"}</td>
                            <td>{item.serialNumber || "-"}</td>
                            <td>{item.dateOfPurchase || "-"}</td>
                            <td>{item.returnDate || "-"}</td>
                            <td>{item.problem || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            style={{
                              textAlign: "center",
                              padding: "20px",
                              color: "#999",
                            }}
                          >
                            {productFilter
                              ? "No products match your search"
                              : "No items found"}
                          </td>
                        </tr>
                      )}
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
