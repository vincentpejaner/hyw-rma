import { useEffect, useState } from "react";
import "./my-rma.css";
import "./submit.css";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

const API_BASE = `http://${window.location.hostname}:3001`;

function getStoredAccount() {
  try {
    const rawAccount = window.localStorage.getItem("account");
    return rawAccount ? JSON.parse(rawAccount) : null;
  } catch {
    return null;
  }
}

export default function MyRma() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const account = getStoredAccount();
  const accountEmail =
    account?.account_email || account?.account_username || "";

  if (!accountEmail) {
    return null;
  }

  return (
    <div className="my-rma-page">
      <SiteHeader />

      <main className="my-rma-main">
        <section className="my-rma-hero">
          <h1>My RMA Requests</h1>
          <p>View all RMA requests submitted using your signed-in account.</p>
        </section>

        {loading && (
          <div className="my-rma-state">Loading your RMA requests...</div>
        )}

        {!loading && error && <div className="my-rma-state">{error}</div>}

        {!loading && !error && requests.length === 0 && (
          <div className="my-rma-state">
            No RMA requests found for this account yet.
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <section className="my-rma-list">
            {requests.map((request) => (
              <article className="my-rma-card" key={request.ticketNumber}>
                <div className="my-rma-card-header">
                  <div>
                    <h2>{request.productModel || "Unnamed Product"}</h2>
                    <p className="my-rma-ticket">
                      Ticket ID: {request.ticketNumber}
                    </p>
                  </div>
                  <span className="my-rma-status">
                    {request.status || "Submitted"}
                  </span>
                </div>

                <div className="my-rma-grid">
                  <div className="my-rma-field">
                    <div className="my-rma-label">Issue Type</div>
                    <div className="my-rma-value">
                      {request.issueType || "-"}
                    </div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Preferred Resolution</div>
                    <div className="my-rma-value">
                      {request.preferredResolution || "-"}
                    </div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Serial Number</div>
                    <div className="my-rma-value">
                      {request.serialNumber || "-"}
                    </div>
                  </div>

                  <div className="my-rma-field">
                    <div className="my-rma-label">Purchase Date</div>
                    <div className="my-rma-value">
                      {request.purchaseDate || "-"}
                    </div>
                  </div>

                  <div className="my-rma-field full">
                    <div className="my-rma-label">Issue Description</div>
                    <div className="my-rma-value">
                      {request.issueDescription || "-"}
                    </div>
                  </div>
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
