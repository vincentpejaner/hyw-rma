import "./form.css";
import "./submit.css";
import { useState } from "react";
import logo from "./images/logo1.png";

function Submit() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [randomString, setRandomString] = useState("");
  const [inputData, setInputData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    productModel: "",
    serialNumber: "",
    issueType: "",
    purchaseDate: "",
    preferredResolution: "",
    issueDescription: "",
    ticketNumber: "",
  });

  const generateRandomString = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
  
    setRandomString(result);
    return result;
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ticketNumber = randomString || generateRandomString();
    const dataToSend = { ...inputData, ticketNumber };
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    } else {
      const response = await fetch("http://localhost:3001/api/hyw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Server responded with error:", errData);
        alert("❌ Submission failed: " + (errData.error || response.statusText));
        return;
      }

      setInputData({
        fullName: "",
        emailAddress: "",
        phoneNumber: "",
        productModel: "",
        serialNumber: "",
        issueType: "",
        purchaseDate: "",
        preferredResolution: "",
        issueDescription: "",
        ticketNumber: "",
      });
    }

    alert("✅ RMA request submitted!");
    form.reset();
  };

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
          <a className="header-login" href="#login">
            Log In
          </a>
        </div>
      </header>

      <main className="submit-main">
        <div className="submit-form-container">
          <form onSubmit={handleSubmit} className="form">
            <section className="section">
              <h2>Customer Information</h2>

              <div className="grid">
                <div className="field">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <input
                    name="fullName"
                    required
                    placeholder="Juan Dela Cruz"
                    value={inputData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>
                    Email <span>*</span>
                  </label>
                  <input
                    name="emailAddress"
                    type="email"
                    required
                    placeholder="juan@email.com"
                    value={inputData.emailAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>
                    Phone Number <span>*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    required
                    placeholder="09xxxxxxxxx"
                    value={inputData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="section">
              <h2>Product Information</h2>

              <div className="grid">
                <div className="field">
                  <label>
                    Product Name / Model <span>*</span>
                  </label>
                  <input
                    name="productModel"
                    required
                    placeholder="e.g., XYZ-1000"
                    value={inputData.productModel}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>
                    Serial Number <span>*</span>
                  </label>
                  <input
                    name="serialNumber"
                    required
                    placeholder="SN123456789"
                    value={inputData.serialNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>
                    Purchase Date <span>*</span>
                  </label>
                  <input
                    name="purchaseDate"
                    type="date"
                    required
                    value={inputData.purchaseDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="section">
              <h2>Issue Details</h2>

              <div className="grid">
                <div className="field">
                  <label>
                    Issue Type <span>*</span>
                  </label>
                  <select
                    name="issueType"
                    required
                    value={inputData.issueType}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select issue type
                    </option>
                    <option value="Defective">Defective</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Missing Parts">Missing Parts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    Preferred Resolution <span>*</span>
                  </label>
                  <select
                    name="preferredResolution"
                    required
                    value={inputData.preferredResolution}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select resolution
                    </option>
                    <option value="Repair">Repair</option>
                    <option value="Replace">Replace</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>

                <div className="field field-full">
                  <label>
                    Issue Description <span>*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    required
                    rows={5}
                    placeholder="Describe the problem clearly (symptoms, error messages, when it happens, etc.)"
                    value={inputData.issueDescription}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="agree">
                <input id="agree" name="agree" type="checkbox" required />
                <label htmlFor="agree">
                  I confirm the details above are accurate. <span>*</span>
                </label>
              </div>
            </section>

            <div className="actions">
              <button type="reset" className="btn btn-ghost">
                Clear
              </button>
              <button type="submit" className="btn btn-primary" typeof="submit">
                Submit RMA
              </button>
            </div>
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
export default Submit;
