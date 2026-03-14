import { useEffect, useRef, useState } from "react";
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

function handleProfile() {
  const account = JSON.parse(window.localStorage.getItem("account"));
  window.location.hash = `#profile/${account.account_id}`;
}

export default function AuthMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const account = getStoredAccount();
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

  const handleLogout = () => {
    setMenuOpen(false);
    const storedAccount = JSON.parse(window.localStorage.getItem("account"));

    if (storedAccount?.account_id) {
      fetch(`https://hyw-rma-production-81c6.up.railway.app/api/hyw/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: storedAccount.account_id,
        }),
      }).catch(() => {  
 
      });
    }

    localStorage.clear();
    window.location.hash = "#login";
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
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
