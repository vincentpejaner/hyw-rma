import "./submit.css";
import { useEffect, useState } from "react";
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

const STATUS_OPTIONS = [
  "Submitted",
  "Received",
  "Diagnosing",
  "Repairing",
  "Replaced",
  "Released",
];

const createEmptySelection = () => ({
  category: "",
  quantity: "1",
});

const createGeneratedItem = (itemNo, category = "Others") => ({
  itemNo,
  category,
  itemDescription: category,
  serialNumber: "",
  dateOfPurchase: "",
  returnDate: "",
  problem: "",
  status: "Submitted",
  remark: "",
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
  const isAuthenticated = Boolean(accountId);

  const [menuOpen, setMenuOpen] = useState(false);

  // selections is kept in state for stage-to-stage continuity.
  const [selections, setSelections] = useState([createEmptySelection()]);

  // generatedItems contains editable row data for the generated RMA table.
  const [generatedItems, setGeneratedItems] = useState([]);
  const [isFormGenerated, setIsFormGenerated] = useState(false);

  const [errors, setErrors] = useState({
    rows: [{ category: "", quantity: "" }],
    form: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = "#login";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const validateSelections = (rows) => {
    if (!rows.length) {
      return {
        isValid: false,
        rowErrors: [],
        formError: "At least one category row must exist.",
      };
    }

    const rowErrors = rows.map(() => ({ category: "", quantity: "" }));
    const selectedCategories = new Map();
    let isValid = true;

    rows.forEach((row, index) => {
      if (!row.category) {
        rowErrors[index].category = "Category is required.";
        isValid = false;
      } else if (selectedCategories.has(row.category)) {
        rowErrors[index].category = "Duplicate category is not allowed.";
        const firstIndex = selectedCategories.get(row.category);
        rowErrors[firstIndex].category = "Duplicate category is not allowed.";
        isValid = false;
      } else {
        selectedCategories.set(row.category, index);
      }

      const quantityNumber = Number(row.quantity);
      if (!row.quantity || Number.isNaN(quantityNumber) || quantityNumber < 1) {
        rowErrors[index].quantity = "Quantity must be a valid number >= 1.";
        isValid = false;
      }
    });

    return {
      isValid,
      rowErrors,
      formError: "",
    };
  };

  const handleSelectionChange = (index, field, value) => {
    const nextSelections = selections.map((selection, rowIndex) =>
      rowIndex === index ? { ...selection, [field]: value } : selection,
    );

    setSelections(nextSelections);
  };

  const handleAddCategory = () => {
    setSelections((prev) => [...prev, createEmptySelection()]);
    setErrors((prev) => ({
      ...prev,
      rows: [...prev.rows, { category: "", quantity: "" }],
    }));
  };

  const handleRemoveCategory = (index) => {
    if (selections.length === 1) {
      return;
    }

    const nextSelections = selections.filter((_, rowIndex) => rowIndex !== index);

    setSelections(nextSelections);
    setErrors((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleGenerateForm = () => {
    const validation = validateSelections(selections);

    setErrors({
      rows: validation.rowErrors,
      form: validation.formError,
    });

    if (!validation.isValid) {
      setGeneratedItems([]);
      setIsFormGenerated(false);
      return;
    }

    // Store normalized quantity as numbers for later processing.
    const normalizedSelections = selections.map((row) => ({
      category: row.category,
      quantity: Number(row.quantity),
    }));

    setSelections(normalizedSelections);

    const nextGeneratedItems = [];
    let itemCounter = 1;

    normalizedSelections.forEach((row) => {
      for (let i = 0; i < row.quantity; i += 1) {
        nextGeneratedItems.push(createGeneratedItem(itemCounter, row.category));
        itemCounter += 1;
      }
    });

    setGeneratedItems(nextGeneratedItems);
    setIsFormGenerated(true);
  };

  const resequenceGeneratedItems = (items) =>
    items.map((item, index) => ({ ...item, itemNo: index + 1 }));

  const handleGeneratedItemChange = (index, field, value) => {
    setGeneratedItems((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddGeneratedRow = () => {
    setGeneratedItems((prev) => {
      const fallbackCategory = selections[0]?.category || "Others";
      const nextRow = createGeneratedItem(prev.length + 1, fallbackCategory);
      return [...prev, nextRow];
    });
  };

  const handleDeleteGeneratedRow = (index) => {
    setGeneratedItems((prev) => {
      const filtered = prev.filter((_, rowIndex) => rowIndex !== index);
      return resequenceGeneratedItems(filtered);
    });
  };

  const handleSubmitGeneratedForm = () => {
    // Stage 2 will replace this with actual submission logic.
    window.alert("RMA form is ready for submission flow.");
  };

  const hasDraftData =
    generatedItems.length > 0 ||
    selections.some(
      (row) => Boolean(row.category) || Number(row.quantity || 0) !== 1,
    );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasDraftData) {
        return;
      }

      // Required for browser-native refresh/close confirmation dialog.
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasDraftData]);

  const totalItems = generatedItems.length;

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
        <section className="submit-card">
          <h1>RMA Item Generator</h1>
          <p className="submit-card-subtitle">
            Add category entries and quantities, then generate editable RMA rows.
          </p>

          {!isFormGenerated && (
            <>
              <div className="selection-list">
                {selections.map((row, index) => {
                  const usedInOtherRows = selections
                    .filter((_, rowIndex) => rowIndex !== index)
                    .map((selection) => selection.category)
                    .filter(Boolean);

                  return (
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
                          <option value="">Select category</option>
                          {CATEGORY_OPTIONS.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={usedInOtherRows.includes(option)}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.rows[index]?.category && (
                          <p className="field-error">{errors.rows[index].category}</p>
                        )}
                      </div>

                      <div className="field-group quantity-group">
                        <label htmlFor={`quantity-${index}`}>Quantity</label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          step="1"
                          value={row.quantity}
                          onChange={(event) =>
                            handleSelectionChange(index, "quantity", event.target.value)
                          }
                        />
                        {errors.rows[index]?.quantity && (
                          <p className="field-error">{errors.rows[index].quantity}</p>
                        )}
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
                  );
                })}
              </div>

              {errors.form && <p className="form-error">{errors.form}</p>}

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

          <div className="summary-row">Total Items: {totalItems}</div>

          {generatedItems.length > 0 && (
            <>
              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Item #</th>
                      <th>Item Description</th>
                      <th>Serial Number</th>
                      <th>Date of Purchase</th>
                      <th>Return Date</th>
                      <th>Problem</th>
                      <th>Status</th>
                      <th>Remark</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedItems.map((item, index) => (
                      <tr key={`item-${item.itemNo}`}>
                        <td>{item.itemNo}</td>
                        <td>
                          <input
                            type="text"
                            value={item.itemDescription}
                            onChange={(event) =>
                              handleGeneratedItemChange(
                                index,
                                "itemDescription",
                                event.target.value,
                              )
                            }
                            placeholder="Product model or name"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.serialNumber}
                            onChange={(event) =>
                              handleGeneratedItemChange(
                                index,
                                "serialNumber",
                                event.target.value,
                              )
                            }
                            placeholder="Serial number"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={item.dateOfPurchase}
                            onChange={(event) =>
                              handleGeneratedItemChange(
                                index,
                                "dateOfPurchase",
                                event.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={item.returnDate}
                            onChange={(event) =>
                              handleGeneratedItemChange(
                                index,
                                "returnDate",
                                event.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.problem}
                            onChange={(event) =>
                              handleGeneratedItemChange(index, "problem", event.target.value)
                            }
                            placeholder="Issue description"
                          />
                        </td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(event) =>
                              handleGeneratedItemChange(index, "status", event.target.value)
                            }
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(event) =>
                              handleGeneratedItemChange(index, "remark", event.target.value)
                            }
                            placeholder="Technician comments"
                          />
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
                  Submit Form
                </button>
              </div>
            </>
          )}
        </section>
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
