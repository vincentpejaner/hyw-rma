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
  const [generatedItemErrors, setGeneratedItemErrors] = useState([]);
  const [generatedFormError, setGeneratedFormError] = useState("");
  const [isFormGenerated, setIsFormGenerated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSnapshot, setSubmissionSnapshot] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    companyPhone: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
  });

  const [errors, setErrors] = useState({
    rows: [{ category: "", quantity: "" }],
    form: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = "#login";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    let isActive = true;

    async function loadProfileData() {
      try {
        const response = await fetch(
          `http://192.168.254.148:3001/api/hyw/selectprofile/${accountId}`,
        );
        const responseData = await response.json();

        if (!response.ok || !isActive) {
          return;
        }

        const profile = responseData?.profile || responseData || {};
        setProfileData({
          fullName: profile.db_fullname || "",
          companyPhone: profile.db_phone_number || "",
          companyEmail: profile.db_companyEmail || "",
          companyName: profile.db_companyName || "",
          companyAddress: profile.db_companyAddress || "",
        });
      } catch (error) {
        console.error("Failed to load profile data:", error);
      }
    }

    loadProfileData();

    return () => {
      isActive = false;
    };
  }, [accountId]);

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
    setGeneratedItemErrors(
      nextGeneratedItems.map(() => ({
        itemDescription: "",
        serialNumber: "",
        dateOfPurchase: "",
        returnDate: "",
        problem: "",
      })),
    );
    setGeneratedFormError("");
    setIsFormGenerated(true);
    setIsSubmitted(false);
    setSubmissionSnapshot(null);
  };

  const resequenceGeneratedItems = (items) =>
    items.map((item, index) => ({ ...item, itemNo: index + 1 }));

  const handleGeneratedItemChange = (index, field, value) => {
    setGeneratedItems((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    setGeneratedItemErrors((prev) =>
      prev.map((rowError, rowIndex) =>
        rowIndex === index ? { ...rowError, [field]: "" } : rowError,
      ),
    );
    setGeneratedFormError("");
  };

  const handleAddGeneratedRow = () => {
    setGeneratedItems((prev) => {
      const fallbackCategory = selections[0]?.category || "Others";
      const nextRow = createGeneratedItem(prev.length + 1, fallbackCategory);
      return [...prev, nextRow];
    });
    setGeneratedItemErrors((prev) => [
      ...prev,
      {
        itemDescription: "",
        serialNumber: "",
        dateOfPurchase: "",
        returnDate: "",
        problem: "",
      },
    ]);
  };

  const handleDeleteGeneratedRow = (index) => {
    setGeneratedItems((prev) => {
      const filtered = prev.filter((_, rowIndex) => rowIndex !== index);
      if (filtered.length === 0) {
        setIsFormGenerated(false);
      }
      return resequenceGeneratedItems(filtered);
    });
    setGeneratedItemErrors((prev) =>
      prev.filter((_, rowIndex) => rowIndex !== index),
    );
    setGeneratedFormError("");
  };

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
      if (!String(item.itemDescription || "").trim()) {
        rowErrors[index].itemDescription = "Item description is required.";
        isValid = false;
      }
      if (!String(item.serialNumber || "").trim()) {
        rowErrors[index].serialNumber = "Serial number is required.";
        isValid = false;
      }
      if (!item.dateOfPurchase) {
        rowErrors[index].dateOfPurchase = "Date of purchase is required.";
        isValid = false;
      }
      if (!item.returnDate) {
        rowErrors[index].returnDate = "Return date is required.";
        isValid = false;
      }
      if (!String(item.problem || "").trim()) {
        rowErrors[index].problem = "Problem is required.";
        isValid = false;
      }
    });

    return {
      isValid,
      rowErrors,
    };
  };

  const handleSubmitGeneratedForm = () => {
    if (!generatedItems.length) {
      return;
    }

    const validation = validateGeneratedItems(generatedItems);
    setGeneratedItemErrors(validation.rowErrors);

    if (!validation.isValid) {
      setGeneratedFormError("Please complete all required item details before submitting.");
      return;
    }

    setGeneratedFormError("");

    setSubmissionSnapshot({
      submittedAt: new Date().toISOString(),
      totalItems: generatedItems.length,
      items: generatedItems.map((item) => ({ ...item })),
    });
    setIsSubmitted(true);
  };

  const handleEditSubmittedForm = () => {
    setIsSubmitted(false);
    setIsFormGenerated(true);
  };

  const handlePrintPdf = () => {
    const rowCount = submissionSnapshot?.items?.length || 0;
    const computedScale = Math.max(0.35, 1 - Math.max(0, rowCount - 6) * 0.022);
    const computedFontSize = rowCount > 36 ? 6.5 : rowCount > 26 ? 7.5 : 9;
    const computedCellPadding = rowCount > 36 ? 1 : rowCount > 26 ? 2 : 3;

    document.body.classList.add("single-page-print");
    document.body.style.setProperty("--print-scale", String(computedScale));
    document.body.style.setProperty("--print-font-size", `${computedFontSize}px`);
    document.body.style.setProperty("--print-cell-padding", `${computedCellPadding}px`);

    const cleanupPrintMode = () => {
      document.body.classList.remove("single-page-print");
      document.body.style.removeProperty("--print-scale");
      document.body.style.removeProperty("--print-font-size");
      document.body.style.removeProperty("--print-cell-padding");
      window.removeEventListener("afterprint", cleanupPrintMode);
    };

    window.addEventListener("afterprint", cleanupPrintMode);
    window.print();
  };

  const handleExtractExcel = async () => {
    if (!submissionSnapshot?.items?.length) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "HYW RMA System";
    workbook.lastModifiedBy = "HYW RMA System";
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet("RMA Summary", {
      views: [{ state: "frozen", ySplit: 8 }],
    });

    sheet.columns = [
      { key: "itemNo", width: 10 },
      { key: "itemDescription", width: 30 },
      { key: "serialNumber", width: 24 },
      { key: "dateOfPurchase", width: 18 },
      { key: "returnDate", width: 18 },
      { key: "problem", width: 42 },
    ];

    sheet.mergeCells("A1:F1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "HYW RMA FORM SUMMARY";
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F2937" },
    };
    sheet.getRow(1).height = 28;

    const metadataRows = [
      ["Company", profileData.companyName || profileData.fullName || "-"],
      ["Address", profileData.companyAddress || "-"],
      ["Email", profileData.companyEmail || "-"],
      ["Phone", profileData.companyPhone || "-"],
      ["Submitted", submittedAtText || "-"],
      ["Total Items", submittedTotal],
    ];

    metadataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      sheet.getCell(`A${rowNumber}`).value = row[0];
      sheet.getCell(`B${rowNumber}`).value = row[1];
      sheet.getCell(`A${rowNumber}`).font = { bold: true };
      sheet.mergeCells(`B${rowNumber}:F${rowNumber}`);
    });

    const headerRowNumber = 8;
    const headerRow = sheet.getRow(headerRowNumber);
    headerRow.values = [
      "Item #",
      "Item Description",
      "Serial Number",
      "Date of Purchase",
      "Return Date",
      "Problem",
    ];
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF111827" },
    };
    headerRow.height = 22;

    submissionSnapshot.items.forEach((item) => {
      sheet.addRow([
        item.itemNo,
        item.itemDescription || "-",
        item.serialNumber || "-",
        item.dateOfPurchase || "-",
        item.returnDate || "-",
        item.problem || "-",
      ]);
    });

    const dataStart = headerRowNumber + 1;
    const dataEnd = sheet.lastRow?.number || dataStart;

    for (let row = headerRowNumber; row <= dataEnd; row += 1) {
      for (let col = 1; col <= 6; col += 1) {
        const cell = sheet.getRow(row).getCell(col);
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
        if (row >= dataStart) {
          cell.alignment = {
            vertical: "top",
            horizontal: col === 1 ? "center" : "left",
            wrapText: true,
          };
        }
      }
    }

    for (let row = dataStart; row <= dataEnd; row += 1) {
      const fillColor = row % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF";
      for (let col = 1; col <= 6; col += 1) {
        sheet.getRow(row).getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      }
    }

    const summaryTextRow = dataEnd + 2;
    sheet.mergeCells(`A${summaryTextRow}:F${summaryTextRow}`);
    const footerCell = sheet.getCell(`A${summaryTextRow}`);
    footerCell.value = "Generated by HYW RMA Management System";
    footerCell.font = { italic: true, color: { argb: "FF6B7280" } };
    footerCell.alignment = { horizontal: "right" };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob(
      [buffer],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSuffix = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `rma-summary-${dateSuffix}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
  const submittedItems = submissionSnapshot?.items ?? [];
  const submittedTotal = submissionSnapshot?.totalItems ?? 0;
  const submittedAtText = submissionSnapshot?.submittedAt
    ? new Date(submissionSnapshot.submittedAt).toLocaleString()
    : "";
  const submittedCategorySummary = submittedItems.reduce((acc, item) => {
    const key = item.category || "Others";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

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
          {!isSubmitted && (
            <>
              <h1>RMA Item Generator</h1>
              <p className="submit-card-subtitle">
                Add category entries and quantities, then generate editable RMA rows.
              </p>
            </>
          )}

          {!isSubmitted && !isFormGenerated && (
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

          {!isSubmitted && <div className="summary-row">Total Items: {totalItems}</div>}

          {!isSubmitted && generatedItems.length > 0 && (
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
                          {generatedItemErrors[index]?.itemDescription && (
                            <p className="table-field-error">
                              {generatedItemErrors[index].itemDescription}
                            </p>
                          )}
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
                          {generatedItemErrors[index]?.serialNumber && (
                            <p className="table-field-error">
                              {generatedItemErrors[index].serialNumber}
                            </p>
                          )}
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
                          {generatedItemErrors[index]?.dateOfPurchase && (
                            <p className="table-field-error">
                              {generatedItemErrors[index].dateOfPurchase}
                            </p>
                          )}
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
                          {generatedItemErrors[index]?.returnDate && (
                            <p className="table-field-error">
                              {generatedItemErrors[index].returnDate}
                            </p>
                          )}
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
                  Submit Form
                </button>
              </div>
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
              <p className="summary-meta">Submitted: {submittedAtText}</p>
              <p className="summary-meta">Total Items: {submittedTotal}</p>

              <div className="summary-breakdown">
                <h3>Category Breakdown</h3>
                <div className="summary-chip-list">
                  {Object.entries(submittedCategorySummary).map(([category, count]) => (
                    <span key={category} className="summary-chip">
                      {category}: {count}
                    </span>
                  ))}
                </div>
              </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {submittedItems.map((item) => (
                      <tr key={`submitted-item-${item.itemNo}`}>
                        <td>{item.itemNo}</td>
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

              <div className="summary-actions no-print">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleEditSubmittedForm}
                >
                  Edit Form
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handlePrintPdf}
                >
                  Print Form (PDF)
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  disabled
                >
                  Save
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleExtractExcel}
                >
                  Extract in Excel
                </button>
              </div>
            </div>
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



