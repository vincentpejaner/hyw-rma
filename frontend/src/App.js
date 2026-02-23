import "./App.css";
import { useState } from "react";

function App() {
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
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    } else {
      console.log("Submitted Data: ", inputData);
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
      });
    }

    alert("✅ RMA request submitted!");
    form.reset();
  };

  return (
    <div className="page">
      <main className="card">
        <div className="header">
          <div>
            <h1>RMA Request</h1>
            <p className="sub">
              Fill out the details below. Fields marked <span>*</span> are
              required.
            </p>
          </div>
          <div className="badge">Form</div>
        </div>

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
                  value={inputData.productName}
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
                  defaultValue=""
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
                  defaultValue=""
                  value={inputData.replaceResol}
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

        <footer className="footer">
          <small>
            After submitting, you’ll receive an email confirmation (if enabled
            in your backend).
          </small>
        </footer>
      </main>
    </div>
  );
}

export default App;
