import "./profile.css";
import { useState } from "react";
import AuthMenu from "./auth-menu.jsx";
import logo from "./images/logo1.png";

function Profile() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [data, setData] = useState({
    companyName: "",
    fullName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const storedAccount = JSON.parse(localStorage.getItem("account"));
    const accountId = storedAccount?.account_id;

    const dataToSend = {
      ...data,
      accountId: Number(accountId),
    };

    try {
      const response = await fetch(
        `http://${window.location.hostname}:3001/api/hyw/profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.log(result.message || "Failed to update profile.");
      } else {
        console.log("Profile updated successfully!");
        console.log(result); // ✅ use result, not response.json()
      }
    } catch (error) {
      console.log("Server error:", error);
    }
  }

  return (
    <div className="submit-container">
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
          <nav
            className={`header-nav header-nav-left ${menuOpen ? "active" : ""}`}
          >
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
          <nav
            className={`header-nav header-nav-right ${menuOpen ? "active" : ""}`}
          >
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

      <main className="submit-main">
        <div className="profile-card">
          <h1>Account Settings</h1>

          <form className="profile-form">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={data.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div>

            <div className="form-group">
              <label>Contact Person / Full Name</label>
              <input
                type="text"
                name="fullName"
                value={data.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="companyEmail"
                value={data.companyEmail}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                name="companyPhone"
                value={data.companyPhone}
                onChange={handleChange}
                placeholder="Enter contact number"
              />
            </div>

            <div className="form-group">
              <label>Company Address</label>
              <textarea
                name="companyAddress"
                value={data.companyAddress}
                onChange={handleChange}
                placeholder="Enter company address"
              />
            </div>

            <button
              type="submit"
              className="save-button"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>

      <footer className="page-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HYW</h3>
            <p>
              HYW RMA Management System - Your trusted return and warranty
              solution.
            </p>
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

export default Profile;
