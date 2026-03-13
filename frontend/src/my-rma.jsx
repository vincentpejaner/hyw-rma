import { useEffect, useMemo, useState } from "react";
import "./my-rma.css";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

const API_BASE = "http://26.246.128.102:3001/api/hyw/mine";

function getStoredAccount() {
  try {
    const rawAccount = window.localStorage.getItem("account");
    return rawAccount ? JSON.parse(rawAccount) : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function MyRma() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const account = getStoredAccount();
  const accountId = account?.account_id ? Number(account.account_id) : null;

  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      setError("Please sign in to view your submitted RMA requests.");
      return;
    }

    async function loadRequests() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/mine/${accountId}`);
        const contentType = response.headers.get("content-type") || "";
        const result = contentType.includes("application/json")
          ? await response.json()
          : null;

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load your RMA requests.");
        }

        if (!result) {
          throw new Error(
            "The server returned an invalid response. Restart the backend and try again.",
          );
        }

        setRequests(Array.isArray(result?.requests) ? result.requests : []);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError?.message || "Failed to load your RMA requests.");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [accountId]);

  const totalItems = useMemo(
    () => requests.reduce((sum, request) => sum + Number(request.totalItems || 0), 0),
    [requests],
  );

  return (
    <div className="my-rma-page">
      <SiteHeader />

      <main className="my-rma-main">
        <section className="my-rma-hero">
          <div>
            <p className="my-rma-eyebrow">My RMA Request</p>
            <h1>Your submitted RMA forms, grouped by ticket.</h1>
            <p>
              Review every form submitted under your signed-in account, including
              item details, serial numbers, issue descriptions, and current status.
            </p>
          </div>

          <div className="my-rma-hero-stats">
            <div className="my-rma-stat-card">
              <span className="my-rma-stat-label">Total requests</span>
              <strong>{requests.length}</strong>
              <span className="my-rma-stat-note">Grouped by submitted form ticket</span>
            </div>
            <div className="my-rma-stat-card">
              <span className="my-rma-stat-label">Total items</span>
              <strong>{totalItems}</strong>
              <span className="my-rma-stat-note">Across all requests in your history</span>
            </div>
          </div>
        </section>

        {loading && (
          <div className="my-rma-state">
            <span className="my-rma-spinner" aria-hidden="true" />
            <span>Loading your RMA requests...</span>
          </div>
        )}

        {!loading && error && <div className="my-rma-state is-error">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="my-rma-state">
            No RMA requests found for this account yet.
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <section className="my-rma-list">
            {requests.map((request) => (
              <article className="my-rma-card" key={request.ticketId}>
                <div className="my-rma-card-header">
                  <div>
                    <p className="my-rma-ticket-kicker">Form Ticket ID</p>
                    <h2>{request.ticketId}</h2>
                    <p className="my-rma-ticket-meta">
                      {request.submittedBy?.companyName ||
                        request.submittedBy?.fullName ||
                        "Unnamed account"}
                    </p>
                  </div>
                  <div className="my-rma-card-badges">
                    <span className="my-rma-items-badge">
                      {request.totalItems} item{request.totalItems === 1 ? "" : "s"}
                    </span>
                    <span className="my-rma-status">{request.status || "Submitted"}</span>
                  </div>
                </div>

                <div className="my-rma-account-strip">
                  <span>{request.submittedBy?.companyAddress || "-"}</span>
                  <span>{request.submittedBy?.companyEmail || "-"}</span>
                  <span>{request.submittedBy?.companyPhone || "-"}</span>
                </div>

                <div className="my-rma-table-shell">
                  <table className="my-rma-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Serial Number</th>
                        <th>Purchase Date</th>
                        <th>Return Date</th>
                        <th>Problem</th>
                        <th>Item Ticket</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.items.map((item) => (
                        <tr key={`${request.ticketId}-${item.itemNo}-${item.productTicket}`}>
                          <td>{item.itemNo}</td>
                          <td>{item.category || "-"}</td>
                          <td>{item.itemDescription || "-"}</td>
                          <td>{item.serialNumber || "-"}</td>
                          <td>{formatDate(item.dateOfPurchase)}</td>
                          <td>{formatDate(item.returnDate)}</td>
                          <td>{item.problem || "-"}</td>
                          <td className="my-rma-mono">{item.productTicket || "-"}</td>
                          <td>
                            <span className="my-rma-status-chip">
                              {item.resolution || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
