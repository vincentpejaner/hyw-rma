import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./auth-menu.css";
import { API_BASE } from "./api-base.js";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23f3f4f6'/%3E%3Ccircle cx='32' cy='24' r='12' fill='%239ca3af'/%3E%3Cpath d='M14 52c2-10 10-16 18-16s16 6 18 16' fill='%239ca3af'/%3E%3C/svg%3E";

function getStoredAccount() {
  try {
    const rawAccount = window.localStorage.getItem("account");
    if (!rawAccount) {
      return null;
    }
    const parsed = JSON.parse(rawAccount);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getAccountId(account) {
  const rawId = account?.account_id ?? account?.accountId ?? account?.id;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function handleProfile() {
  const account = JSON.parse(window.localStorage.getItem("account"));
  const accountId = getAccountId(account);

  if (!accountId) {
    window.location.hash = "#login";
    return;
  }

  window.location.hash = `#profile/${accountId}`;
}

export default function AuthMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const menuRef = useRef(null);
  const [account, setAccount] = useState(() => getStoredAccount());
  const [darkMode, setDarkMode] = useState(
    () => window.localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    const syncAccount = () => {
      setAccount(getStoredAccount());
    };

    window.addEventListener("storage", syncAccount);
    window.addEventListener("hashchange", syncAccount);
    window.addEventListener("focus", syncAccount);

    return () => {
      window.removeEventListener("storage", syncAccount);
      window.removeEventListener("hashchange", syncAccount);
      window.removeEventListener("focus", syncAccount);
    };
  }, []);

  if (!account) {
    return (
      <a className="header-login" href="#login">
        Log In
      </a>
    );
  }

  const accountName =
    account.account_name ||
    account.account_username ||
    account.account_email ||
    "Account";
  const accountEmail = account.account_email || account.account_username || "";
  const logoutOverlay = isLoggingOut
    ? createPortal(
        <div className="logout-loading-overlay" aria-live="polite">
          <div className="logout-loading-spinner" aria-hidden="true" />
        </div>,
        document.body,
      )
    : null;

  const handleLogout = async () => {
    setLogoutError("");

    if (!window.navigator.onLine) {
      setLogoutError("No internet connection. Connect first before logging out.");
      return;
    }

    setIsLoggingOut(true);
    setMenuOpen(false);

    try {
      const storedAccount = JSON.parse(window.localStorage.getItem("account"));
      const accountId = getAccountId(storedAccount);

      if (!accountId) {
        throw new Error("Missing account session. Please sign in again.");
      }

      const logoutUrls = [
        `${API_BASE}/logout`,
        "https://hyw-rma-production-81c6.up.railway.app/api/hyw/logout",
      ];

      let lastErrorMessage = "Logout failed. Please try again.";

      for (const url of logoutUrls) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              account_id: accountId,
              accountId,
              token: storedAccount?.token || null,
            }),
          });

          if (response.ok) {
            lastErrorMessage = "";
            break;
          }

          const responseData = await response.json().catch(() => null);
          if (responseData?.message) {
            lastErrorMessage = responseData.message;
          }
        } catch {
          // Try next endpoint.
        }
      }

      if (lastErrorMessage) {
        throw new Error(lastErrorMessage);
      }

      localStorage.clear();
      setAccount(null);
      window.location.hash = "#login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError(
        error?.message ||
          "Could not reach the server. Please check your internet and try again.",
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="auth-menu" ref={menuRef}>
      <button
        type="button"
        className="account-button"
        onClick={() => setMenuOpen((current) => !current)}
      >
        <img
          className="account-avatar account-avatar-small"
          src={DEFAULT_AVATAR}
          alt=""
        />
        {accountName}
      </button>

      {menuOpen && (
        <div className="account-dropdown">
          <div className="account-profile">
            <img className="account-avatar" src={DEFAULT_AVATAR} alt="" />
            <div className="account-details">
              <p className="account-name">{accountName}</p>
              <p className="account-email">{accountEmail}</p>
            </div>
          </div>

          <div className="account-menu-list">
            <button
              type="button"
              className="account-menu-item"
              onClick={() => {
                handleProfile();
                setMenuOpen(false);
              }}
            >
              Account Profile
            </button>

            <a
              className="account-menu-item"
              href="#my-rma"
              onClick={() => setMenuOpen(false)}
            >
              My RMA Request
            </a>
          </div>

          <p className="account-welcome">Welcome {accountName}</p>
          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
          {logoutError && <p className="account-error">{logoutError}</p>}
        </div>
      )}
      {logoutOverlay}
    </div>
  );
}
