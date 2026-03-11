import "./submit.css";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

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

const createSelectionRow = () => ({
  category: "",
  quantity: "1",
});

const createGeneratedItem = (itemNo, category = "Others") => ({
  itemNo,
  category,
  itemDescription: "",
  serialNumber: "",
  dateOfPurchase: "",
  returnDate: "",
  problem: "",
});

const createGeneratedItemError = () => ({
  itemDescription: "",
  serialNumber: "",
  dateOfPurchase: "",
  returnDate: "",
  problem: "",
});

const createTicketId = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `RMA-${datePart}-${timePart}-${randomPart}`;
};

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
  const isAuthenticated = Boolean(accountId);

  const [selections, setSelections] = useState([createSelectionRow()]);
  const [generatedItems, setGeneratedItems] = useState([]);
  const [generatedItemErrors, setGeneratedItemErrors] = useState([]);
  const [generatedFormError, setGeneratedFormError] = useState("");
  const [formTicketId, setFormTicketId] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSnapshot, setSubmissionSnapshot] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    companyPhone: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
  });
  const previousHashRef = useRef(window.location.hash || "#submit");
  const suppressHashPromptRef = useRef(false);

  const hasUnsavedChanges =
    !isSubmitted &&
    (generatedItems.length > 0 ||
      selections.some(
        (row) =>
          String(row.category || "").trim() !== "" ||
          String(row.quantity || "").trim() !== "1",
      ));

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = "#login";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      previousHashRef.current = window.location.hash || "#submit";
      return undefined;
    }

    const warningMessage = "Current form will not be saved. Do you want to leave this page?";

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = warningMessage;
      return warningMessage;
    };

    const handleHashChange = () => {
      if (suppressHashPromptRef.current) {
        suppressHashPromptRef.current = false;
        previousHashRef.current = window.location.hash || "#submit";
        return;
      }

      const nextHash = window.location.hash || "#home";
      const currentHash = previousHashRef.current || "#submit";

      if (nextHash === currentHash) {
        return;
      }

      const shouldLeave = window.confirm(warningMessage);

      if (!shouldLeave) {
        suppressHashPromptRef.current = true;
        window.location.hash = currentHash;
        return;
      }

      previousHashRef.current = nextHash;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    async function loadProfile() {
      try {
        const res = await fetch(
          `http://192.168.254.131:3001/api/hyw/selectprofile/${accountId}`,
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

  if (!isAuthenticated) {
    return null;
  }

  const handleSelectionChange = (index, field, value) => {
    setSelections((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleAddCategory = () => {
    setSelections((prev) => [...prev, createSelectionRow()]);
  };

  const handleRemoveCategory = (index) => {
    if (selections.length === 1) {
      return;
    }
    setSelections((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleGenerateForm = () => {
    const hasInvalidRow = selections.some(
      (row) =>
        !row.category ||
        Number.isNaN(Number(row.quantity)) ||
        Number(row.quantity) < 1,
    );

    if (hasInvalidRow) {
      setGeneratedFormError("Complete all category rows with quantity 1 or higher.");
      return;
    }
    const nextTicketId = createTicketId();

    const items = [];
    let itemNo = 1;

    selections.forEach((row) => {
      const quantity = Number(row.quantity);
      for (let i = 0; i < quantity; i += 1) {
        items.push(createGeneratedItem(itemNo, row.category));
        itemNo += 1;
      }
    });

    setGeneratedItems(items);
    setGeneratedItemErrors(items.map(() => createGeneratedItemError()));
    setFormTicketId(nextTicketId);
    setGeneratedFormError("");
    setIsSubmitted(false);
    setSubmissionSnapshot(null);
  };

  const handleGeneratedItemChange = (index, event) => {
    const { name, value } = event.target;

    setGeneratedItems((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, [name]: value } : item,
      ),
    );

    setGeneratedItemErrors((prev) =>
      prev.map((rowError, rowIndex) =>
        rowIndex === index ? { ...rowError, [name]: "" } : rowError,
      ),
    );
  };

  const handleAddGeneratedRow = () => {
    const fallbackCategory = selections[0]?.category || generatedItems[0]?.category || "Others";

    setGeneratedItems((prev) => [
      ...prev,
      createGeneratedItem(prev.length + 1, fallbackCategory),
    ]);

    setGeneratedItemErrors((prev) => [...prev, createGeneratedItemError()]);
  };

  const handleDeleteGeneratedRow = (index) => {
    setGeneratedItems((prev) =>
      prev
        .filter((_, rowIndex) => rowIndex !== index)
        .map((item, rowIndex) => ({ ...item, itemNo: rowIndex + 1 })),
    );

    setGeneratedItemErrors((prev) =>
      prev.filter((_, rowIndex) => rowIndex !== index),
    );

    if (generatedItems.length === 1) {
      setGeneratedFormError("");
    }
  };

  const validateGeneratedItems = (items) => {
    const rowErrors = items.map(() => createGeneratedItemError());
    let isValid = true;

    items.forEach((item, index) => {
      if (!String(item.itemDescription || "").trim()) {
        rowErrors[index].itemDescription = "Required";
        isValid = false;
      }
      if (!String(item.serialNumber || "").trim()) {
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
      if (!String(item.problem || "").trim()) {
        rowErrors[index].problem = "Required";
        isValid = false;
      }
    });

    return { isValid, rowErrors };
  };

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

    const ticketIdToUse = formTicketId || createTicketId();

    const snapshot = {
      submittedAt: new Date().toISOString(),
      ticketId: ticketIdToUse,
      totalItems: generatedItems.length,
      items: generatedItems.map((item) => ({ ...item })),
    };

    setSubmissionSnapshot(snapshot);
    setGeneratedFormError("");
    setIsSubmitted(true);

    try {
      const response = await fetch("http://192.168.254.131:3001/api/hyw/submit-rma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          ticketId: ticketIdToUse,
          items: generatedItems,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Submission failed.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="submit-container">
      <SiteHeader />

      <main className="submit-main">
        <section className="submit-card">
          {(submissionSnapshot?.ticketId || formTicketId) && (
            <div className="form-ticket-id">
              Ticket ID: {submissionSnapshot?.ticketId || formTicketId}
            </div>
          )}
          {!isSubmitted && (
            <>
              {generatedItems.length === 0 && (
                <>
                  <h1>RMA Item Generator</h1>
                  <p className="submit-card-subtitle">
                    Select one or more categories and quantity, then generate item rows.
                  </p>

                  <div className="selection-list">
                    {selections.map((row, index) => (
                      <div className="selection-row" key={`selection-${index}`}>
                        <div className="field-group">
                          <label htmlFor={`category-${index}`}>Category</label>
                          <select
                            id={`category-${index}`}
                            value={row.category}
                            onChange={(event) =>
                              handleSelectionChange(index, "category", event.target.value)
                            }
                          >
                            <option value="">Select Category</option>
                            {CATEGORY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="field-group quantity-group">
                          <label htmlFor={`quantity-${index}`}>Quantity</label>
                          <input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(event) =>
                              handleSelectionChange(index, "quantity", event.target.value)
                            }
                          />
                        </div>

                        <div className="row-action">
                          <button
                            type="button"
                            className="remove-button"
                            onClick={() => handleRemoveCategory(index)}
                            disabled={selections.length === 1}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="submit-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleAddCategory}
                    >
                      Add Category
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleGenerateForm}
                    >
                      Generate Form
                    </button>
                  </div>
                </>
              )}

              {generatedItems.length > 0 && (
                <>
                  <div className="generated-form-info">
                    <div>
                      <strong>Generated Items:</strong> {generatedItems.length}
                    </div>
                    <div className="generated-form-note">
                      Complete all fields below before submitting your RMA request.
                    </div>
                  </div>
                  <div className="summary-row">Total Items: {generatedItems.length}</div>

                  <div className="preview-table-wrapper">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>
                            Item Category
                            <span
                              className="th-help"
                              data-help="Type selected for this row, such as RAM, SSD, or Monitor."
                              tabIndex={0}
                              role="button"
                              aria-label="Item Category guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>
                            Description
                            <span
                              className="th-help"
                              data-help="Product model or item name so we can identify the exact unit."
                              tabIndex={0}
                              role="button"
                              aria-label="Description guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>
                            Serial
                            <span
                              className="th-help"
                              data-help="Unique serial number from the item sticker, label, or box."
                              tabIndex={0}
                              role="button"
                              aria-label="Serial guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>
                            Purchase
                            <span
                              className="th-help"
                              data-help="Original purchase date from your receipt or invoice."
                              tabIndex={0}
                              role="button"
                              aria-label="Purchase guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>
                            Return
                            <span
                              className="th-help"
                              data-help="Date this item is being sent or returned for RMA."
                              tabIndex={0}
                              role="button"
                              aria-label="Return guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>
                            Problem
                            <span
                              className="th-help"
                              data-help="Short issue details, such as symptoms, errors, or damage."
                              tabIndex={0}
                              role="button"
                              aria-label="Problem guide"
                            >
                              ?
                            </span>
                          </th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedItems.map((item, index) => (
                          <tr key={`generated-${item.itemNo}`}>
                            <td>{item.itemNo}</td>
                            <td>{item.category || "-"}</td>
                            <td>
                              <input
                                name="itemDescription"
                                value={item.itemDescription}
                                onChange={(event) => handleGeneratedItemChange(index, event)}
                                placeholder="Product model/name"
                              />
                              {generatedItemErrors[index]?.itemDescription && (
                                <p className="table-field-error">
                                  {generatedItemErrors[index].itemDescription}
                                </p>
                              )}
                            </td>
                            <td>
                              <input
                                name="serialNumber"
                                value={item.serialNumber}
                                onChange={(event) => handleGeneratedItemChange(index, event)}
                                placeholder="Serial number"
                              />
                              {generatedItemErrors[index]?.serialNumber && (
                                <p className="table-field-error">
                                  {generatedItemErrors[index].serialNumber}
                                </p>
                              )}
                            </td>
                            <td>
                              <input
                                type="date"
                                name="dateOfPurchase"
                                value={item.dateOfPurchase}
                                onChange={(event) => handleGeneratedItemChange(index, event)}
                              />
                              {generatedItemErrors[index]?.dateOfPurchase && (
                                <p className="table-field-error">
                                  {generatedItemErrors[index].dateOfPurchase}
                                </p>
                              )}
                            </td>
                            <td>
                              <input
                                type="date"
                                name="returnDate"
                                value={item.returnDate}
                                onChange={(event) => handleGeneratedItemChange(index, event)}
                              />
                              {generatedItemErrors[index]?.returnDate && (
                                <p className="table-field-error">
                                  {generatedItemErrors[index].returnDate}
                                </p>
                              )}
                            </td>
                            <td>
                              <input
                                name="problem"
                                value={item.problem}
                                onChange={(event) => handleGeneratedItemChange(index, event)}
                                placeholder="Issue description"
                              />
                              {generatedItemErrors[index]?.problem && (
                                <p className="table-field-error">
                                  {generatedItemErrors[index].problem}
                                </p>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="table-delete-button"
                                onClick={() => handleDeleteGeneratedRow(index)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="generated-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleAddGeneratedRow}
                    >
                      Add Item Row
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleSubmitGeneratedForm}
                    >
                      Submit RMA
                    </button>
                  </div>
                </>
              )}

              {generatedFormError && <p className="form-error">{generatedFormError}</p>}
            </>
          )}

          {isSubmitted && submissionSnapshot && (
            <div className="submission-summary">
              <h2>RMA Form Summary</h2>

              <div className="summary-company-block">
                <p className="summary-company-name">
                  {profileData.companyName || profileData.fullName || "-"}
                </p>
                <p>{profileData.companyAddress || "-"}</p>
                <p>{profileData.companyEmail || "-"}</p>
                <p>{profileData.companyPhone || "-"}</p>
              </div>

              <p className="summary-meta">
                Submitted: {new Date(submissionSnapshot.submittedAt).toLocaleString()}
              </p>
              <p className="summary-meta">Total Items: {submissionSnapshot.totalItems}</p>

              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>
                        Item Category
                        <span
                          className="th-help"
                          data-help="Type selected for this row, such as RAM, SSD, or Monitor."
                          tabIndex={0}
                          role="button"
                          aria-label="Item Category guide"
                        >
                          ?
                        </span>
                      </th>
                      <th>
                        Description
                        <span
                          className="th-help"
                          data-help="Product model or item name so we can identify the exact unit."
                          tabIndex={0}
                          role="button"
                          aria-label="Description guide"
                        >
                          ?
                        </span>
                      </th>
                      <th>
                        Serial
                        <span
                          className="th-help"
                          data-help="Unique serial number from the item sticker, label, or box."
                          tabIndex={0}
                          role="button"
                          aria-label="Serial guide"
                        >
                          ?
                        </span>
                      </th>
                      <th>
                        Purchase
                        <span
                          className="th-help"
                          data-help="Original purchase date from your receipt or invoice."
                          tabIndex={0}
                          role="button"
                          aria-label="Purchase guide"
                        >
                          ?
                        </span>
                      </th>
                      <th>
                        Return
                        <span
                          className="th-help"
                          data-help="Date this item is being sent or returned for RMA."
                          tabIndex={0}
                          role="button"
                          aria-label="Return guide"
                        >
                          ?
                        </span>
                      </th>
                      <th>
                        Problem
                        <span
                          className="th-help"
                          data-help="Short issue details, such as symptoms, errors, or damage."
                          tabIndex={0}
                          role="button"
                          aria-label="Problem guide"
                        >
                          ?
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionSnapshot.items.map((item, index) => (
                      <tr key={`submitted-${index + 1}`}>
                        <td>{index + 1}</td>
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
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Submit;
