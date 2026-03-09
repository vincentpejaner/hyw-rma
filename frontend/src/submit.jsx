import "./submit.css";
import { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import AuthMenu from "./auth-menu.jsx";
import logo from "./images/logo1.png";

const CATEGORY_OPTIONS = [
  "Motherboard",
  "Storage (HDD)",
  "Storage (SSD)",
  "Storage (M.2)",
  "Monitor",
  "RAM",
  "Orange Pi",
  "TP-Link",
  "Custom Board",
  "Others",
];

const createGeneratedItem = (itemNo, category = "Others") => ({
  itemNo,
  category,
  itemDescription: "",
  serialNumber: "",
  dateOfPurchase: "",
  returnDate: "",
  problem: "",
});

function Submit() {

  const account = (() => {
    try {
      const rawAccount = window.localStorage.getItem("account");
      return rawAccount ? JSON.parse(rawAccount) : null;
    } catch {
      return null;
    }
  })();

  const accountId = account?.account_id ? Number(account.account_id) : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [generatedItems, setGeneratedItems] = useState([]);
  const [generatedFormError, setGeneratedFormError] = useState("");
  const [generatedItemErrors, setGeneratedItemErrors] = useState([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSnapshot, setSubmissionSnapshot] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    companyPhone: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
  });

  useEffect(() => {

    if (!accountId) return;

    async function loadProfile() {

      try {

        const res = await fetch(
          `http://localhost:3001/api/hyw/selectprofile/${accountId}`
        );

        const data = await res.json();

        const profile = data?.profile || data || {};

        setProfileData({
          fullName: profile.db_fullname || "",
          companyPhone: profile.db_phone_number || "",
          companyEmail: profile.db_companyEmail || "",
          companyName: profile.db_companyName || "",
          companyAddress: profile.db_companyAddress || "",
        });

      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();

  }, [accountId]);

  // GENERATE ROWS
  const handleGenerateForm = () => {

    if (!category || quantity <= 0) {
      setGeneratedFormError("Please select category and quantity.");
      return;
    }

    const items = [];

    for (let i = 0; i < quantity; i++) {

      items.push(createGeneratedItem(i + 1, category));

    }

    setGeneratedItems(items);

    setGeneratedItemErrors(
      items.map(() => ({
        itemDescription: "",
        serialNumber: "",
        dateOfPurchase: "",
        returnDate: "",
        problem: "",
      }))
    );

    setGeneratedFormError("");
  };

  // EDIT ROW
  const handleChange = (index, e) => {

    const { name, value } = e.target;

    const updated = [...generatedItems];

    updated[index][name] = value;

    setGeneratedItems(updated);
  };

  // VALIDATE
  const validateGeneratedItems = (items) => {

    const rowErrors = items.map(() => ({
      itemDescription: "",
      serialNumber: "",
      dateOfPurchase: "",
      returnDate: "",
      problem: "",
    }));

    let isValid = true;

    items.forEach((item, index) => {

      if (!item.itemDescription) {
        rowErrors[index].itemDescription = "Required";
        isValid = false;
      }

      if (!item.serialNumber) {
        rowErrors[index].serialNumber = "Required";
        isValid = false;
      }

      if (!item.dateOfPurchase) {
        rowErrors[index].dateOfPurchase = "Required";
        isValid = false;
      }

      if (!item.returnDate) {
        rowErrors[index].returnDate = "Required";
        isValid = false;
      }

      if (!item.problem) {
        rowErrors[index].problem = "Required";
        isValid = false;
      }

    });

    return { isValid, rowErrors };

  };

  // SUBMIT
  const handleSubmitGeneratedForm = async () => {

    if (!generatedItems.length) {
      setGeneratedFormError("Generate form first.");
      return;
    }

    const validation = validateGeneratedItems(generatedItems);

    setGeneratedItemErrors(validation.rowErrors);

    if (!validation.isValid) {
      setGeneratedFormError("Please complete all required fields.");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:3001/api/hyw/submit-rma",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId: accountId,
            items: generatedItems,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      console.log("Saved:", data);

      setSubmissionSnapshot({
        submittedAt: new Date().toISOString(),
        totalItems: generatedItems.length,
        items: generatedItems,
      });

      setIsSubmitted(true);

    } catch (error) {

      console.error(error);
      setGeneratedFormError("Submission failed.");

    }

  };

  return (
    <div className="submit-container">

      <header className="page-header">

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className="header-logo">
          <img src={logo} alt="HYW Logo" />
        </div>

        <div className="header-actions">
          <AuthMenu />
        </div>

      </header>

      <main className="submit-main">

        {!isSubmitted && (

          <div className="submit-card">

            <h2>RMA Request Form</h2>

            <div>

              <label>Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >

                <option value="">Select Category</option>

                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}

              </select>

            </div>

            <div>

              <label>Quantity</label>

              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

            </div>

            <button onClick={handleGenerateForm}>
              Generate Form
            </button>

            {generatedFormError && (
              <p className="form-error">{generatedFormError}</p>
            )}

          </div>

        )}

        {generatedItems.length > 0 && !isSubmitted && (

          <table className="preview-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Serial</th>
                <th>Purchase</th>
                <th>Return</th>
                <th>Problem</th>
              </tr>
            </thead>

            <tbody>

              {generatedItems.map((item, index) => (

                <tr key={index}>

                  <td>{index + 1}</td>

                  <td>
                    <input
                      name="itemDescription"
                      value={item.itemDescription}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      name="serialNumber"
                      value={item.serialNumber}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      name="dateOfPurchase"
                      value={item.dateOfPurchase}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      type="date"
                      name="returnDate"
                      value={item.returnDate}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      name="problem"
                      value={item.problem}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

        {generatedItems.length > 0 && !isSubmitted && (

          <button
            className="primary-button"
            onClick={handleSubmitGeneratedForm}
          >
            Submit RMA
          </button>

        )}

        {isSubmitted && submissionSnapshot && (

          <div className="submission-summary">

            <h2>RMA Submitted</h2>

            <p>Submitted: {new Date(submissionSnapshot.submittedAt).toLocaleString()}</p>

            <p>Total Items: {submissionSnapshot.totalItems}</p>

            <table className="preview-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Serial</th>
                  <th>Purchase</th>
                  <th>Return</th>
                  <th>Problem</th>
                </tr>
              </thead>

              <tbody>

                {submissionSnapshot.items.map((item, index) => (

                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.itemDescription}</td>
                    <td>{item.serialNumber}</td>
                    <td>{item.dateOfPurchase}</td>
                    <td>{item.returnDate}</td>
                    <td>{item.problem}</td>
                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </main>

    </div>
  );

}

export default Submit;