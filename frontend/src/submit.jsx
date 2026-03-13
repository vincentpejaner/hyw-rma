import "./submit.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ExcelJS from "exceljs";
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
  const [openSelectionCategoryIndex, setOpenSelectionCategoryIndex] =
    useState(null);
  const [openGeneratedCategoryIndex, setOpenGeneratedCategoryIndex] =
    useState(null);
  const [categorySearchValues, setCategorySearchValues] = useState({});
  const [generatedCategoryMenuStyle, setGeneratedCategoryMenuStyle] =
    useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionSnapshot, setSubmissionSnapshot] = useState(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    companyPhone: "",
    companyEmail: "",
    companyName: "",
    companyAddress: "",
  });
  const previousHashRef = useRef(window.location.hash || "#submit");
  const suppressHashPromptRef = useRef(false);
  const generatedCategoryTriggerRefs = useRef({});

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

    const warningMessage =
      "Current form will not be saved. Do you want to leave this page?";

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
          `http://26.246.128.102:3001/api/hyw/selectprofile/${accountId}`,
        );
        const data = await res.json();

        setProfileData({
          fullName: data?.profile?.db_fullname || "",
          companyPhone: data?.profile?.db_phone_number || "",
          companyEmail: data?.profile?.db_companyEmail || "",
          companyName: data?.profile?.db_companyName || "",
          companyAddress: data?.profile?.db_companyAddress || "",
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, [accountId]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        !event.target.closest(".category-select-wrapper") &&
        !event.target.closest(".table-category-menu-floating")
      ) {
        setOpenSelectionCategoryIndex(null);
        setOpenGeneratedCategoryIndex(null);
        setGeneratedCategoryMenuStyle(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenSelectionCategoryIndex(null);
        setOpenGeneratedCategoryIndex(null);
        setGeneratedCategoryMenuStyle(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    setOpenSelectionCategoryIndex(null);
    setOpenGeneratedCategoryIndex(null);
    setSelections((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleOpenCategoryMenu = (index) => {
    setOpenGeneratedCategoryIndex(null);
    setGeneratedCategoryMenuStyle(null);
    setOpenSelectionCategoryIndex((prev) => (prev === index ? null : index));
    setCategorySearchValues((prev) => ({
      ...prev,
      [index]: "",
    }));
  };

  const updateGeneratedCategoryMenuPosition = (index) => {
    const trigger = generatedCategoryTriggerRefs.current[index];
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 240);
    const viewportPadding = 12;
    let left = rect.left;

    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = Math.max(
        viewportPadding,
        window.innerWidth - menuWidth - viewportPadding,
      );
    }

    let top = rect.bottom + 6;
    const estimatedMenuHeight = 260;
    if (top + estimatedMenuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - estimatedMenuHeight - 6);
    }

    setGeneratedCategoryMenuStyle({
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(menuWidth)}px`,
    });
  };

  const handleOpenGeneratedCategoryMenu = (index) => {
    setOpenSelectionCategoryIndex(null);
    setOpenGeneratedCategoryIndex((prev) => {
      const nextIndex = prev === index ? null : index;
      if (nextIndex === null) {
        setGeneratedCategoryMenuStyle(null);
      } else {
        requestAnimationFrame(() => updateGeneratedCategoryMenuPosition(nextIndex));
      }
      return nextIndex;
    });
    setCategorySearchValues((prev) => ({
      ...prev,
      [index]: "",
    }));
  };

  const handleCategorySearchChange = (index, value) => {
    setCategorySearchValues((prev) => ({ ...prev, [index]: value }));
  };

  const handleCategorySelect = (index, category) => {
    handleSelectionChange(index, "category", category);
    setCategorySearchValues((prev) => ({ ...prev, [index]: "" }));
    setOpenSelectionCategoryIndex(null);
  };

  const handleGeneratedCategorySelect = (index, category) => {
    setGeneratedItems((prev) =>
      prev.map((item, rowIndex) =>
        rowIndex === index ? { ...item, category } : item,
      ),
    );
    setCategorySearchValues((prev) => ({ ...prev, [index]: "" }));
    setOpenGeneratedCategoryIndex(null);
    setGeneratedCategoryMenuStyle(null);
  };

  const getFilteredCategories = (index) => {
    const sortedOptions = [...CATEGORY_OPTIONS].sort((a, b) =>
      a.localeCompare(b),
    );
    const query = String(categorySearchValues[index] || "")
      .trim()
      .toLowerCase();
    if (!query) {
      return sortedOptions;
    }

    return sortedOptions.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aIndex = aLower.indexOf(query);
      const bIndex = bLower.indexOf(query);
      const aMatches = aIndex !== -1;
      const bMatches = bIndex !== -1;

      if (aMatches && !bMatches) {
        return -1;
      }
      if (!aMatches && bMatches) {
        return 1;
      }
      if (aMatches && bMatches && aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      return a.localeCompare(b);
    });
  };

  const handleGenerateForm = () => {
    const hasInvalidRow = selections.some(
      (row) =>
        !row.category ||
        Number.isNaN(Number(row.quantity)) ||
        Number(row.quantity) < 1,
    );

    if (hasInvalidRow) {
      setGeneratedFormError(
        "Complete all category rows with quantity 1 or higher.",
      );
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
    setOpenSelectionCategoryIndex(null);
    setOpenGeneratedCategoryIndex(null);
    setGeneratedFormError("");
    setIsSubmitted(false);
    setIsFinalSubmitted(false);
    setShowSubmissionSuccess(false);
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
    const fallbackCategory =
      selections[0]?.category || generatedItems[0]?.category || "Others";

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
      if (
        item.dateOfPurchase &&
        item.returnDate &&
        item.returnDate < item.dateOfPurchase
      ) {
        rowErrors[index].returnDate =
          "Return date must be the same as or after purchase date.";
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
    setGeneratedFormError("");
    setSubmissionSnapshot(snapshot);
    setIsSubmitted(true);
    setIsFinalSubmitted(false);
  };

  const handleEditSummary = () => {
    setIsSubmitted(false);
    setGeneratedFormError("");
  };

  useEffect(() => {
    if (openGeneratedCategoryIndex === null) {
      return undefined;
    }

    const reposition = () => updateGeneratedCategoryMenuPosition(openGeneratedCategoryIndex);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [openGeneratedCategoryIndex, generatedItems]);

  if (!isAuthenticated) {
    return null;
  }

  const handleFinalSubmit = async () => {
    if (!profileData.fullName && !profileData.companyName) {
      setGeneratedFormError(
        "Please complete your customer profile before submitting an RMA.",
      );
      console.log("Customer profile incomplete.");
      return;
    }

    if (!submissionSnapshot?.items?.length || !submissionSnapshot?.ticketId) {
      setGeneratedFormError("Missing submission details.");
      return;
    }

    setIsSubmittingFinal(true);
    setGeneratedFormError("");

    try {
      const response = await fetch(
        "http://192.168.254.131:3001/api/hyw/submit-rma",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId,
            ticketId: submissionSnapshot.ticketId,
            items: submissionSnapshot.items,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Submission failed.");
      }

      setIsFinalSubmitted(true);
      setShowSubmissionSuccess(true);
    } catch (error) {
      setGeneratedFormError(error?.message || "Submission failed.");
      setIsFinalSubmitted(false);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handlePrintRmaPdf = () => {
    const onAfterPrint = () => {
      document.body.classList.remove("single-page-print");
      window.removeEventListener("afterprint", onAfterPrint);
    };

    document.body.classList.add("single-page-print");
    window.addEventListener("afterprint", onAfterPrint);
    window.print();
  };

  const handleExportExcel = async () => {
    if (!submissionSnapshot) {
      return;
    }

    const companyName = profileData.companyName || profileData.fullName || "-";
    const companyAddress = profileData.companyAddress || "-";
    const companyEmail = profileData.companyEmail || "-";
    const companyPhone = profileData.companyPhone || "-";
    const submittedAt = new Date(
      submissionSnapshot.submittedAt,
    ).toLocaleString();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("RMA Form");

    worksheet.columns = [
      { key: "index", width: 7 },
      { key: "category", width: 22 },
      { key: "description", width: 34 },
      { key: "serial", width: 22 },
      { key: "purchase", width: 18 },
      { key: "return", width: 18 },
      { key: "problem", width: 44 },
    ];

    worksheet.mergeCells("A1:G1");
    worksheet.getCell("A1").value = "RMA Submission Report";
    worksheet.getCell("A1").font = {
      size: 18,
      bold: true,
      color: { argb: "FF111827" },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "left",
      vertical: "middle",
    };

    worksheet.getCell("A3").value = "Ticket ID:";
    worksheet.getCell("B3").value = submissionSnapshot.ticketId || "-";
    worksheet.getCell("A4").value = "Submitted:";
    worksheet.getCell("B4").value = submittedAt;
    worksheet.getCell("A5").value = "Total Items:";
    worksheet.getCell("B5").value = submissionSnapshot.totalItems;

    ["A3", "A4", "A5"].forEach((cell) => {
      worksheet.getCell(cell).font = {
        bold: true,
        color: { argb: "FF1F2937" },
      };
    });

    worksheet.mergeCells("A7:G7");
    worksheet.getCell("A7").value = companyName;
    worksheet.getCell("A7").font = {
      size: 15,
      bold: true,
      color: { argb: "FF111827" },
    };
    worksheet.mergeCells("A8:G8");
    worksheet.getCell("A8").value = companyAddress;
    worksheet.mergeCells("A9:G9");
    worksheet.getCell("A9").value = companyEmail;
    worksheet.mergeCells("A10:G10");
    worksheet.getCell("A10").value = companyPhone;

    const headerRowIndex = 12;
    worksheet.getRow(headerRowIndex).values = [
      "#",
      "Item Category",
      "Description",
      "Serial Number",
      "Date of Purchase",
      "Return Date",
      "Problem",
    ];

    worksheet.getRow(headerRowIndex).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF111827" },
      };
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    });

    submissionSnapshot.items.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.category || "-",
        item.itemDescription || "-",
        item.serialNumber || "-",
        item.dateOfPurchase || "-",
        item.returnDate || "-",
        item.problem || "-",
      ]);

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: "left",
          vertical: "top",
          wrapText: colNumber === 3 || colNumber === 7,
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        if (index % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RMA-${submissionSnapshot.ticketId || "report"}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="submit-container">
      {isSubmittingFinal && (
        <div className="submit-overlay" role="status" aria-live="polite">
          <div className="submit-modal loading">
            <div className="submit-spinner" aria-hidden="true"></div>
            <h3>Uploading RMA...</h3>
            <p>Please wait while we save your request.</p>
          </div>
        </div>
      )}

      {showSubmissionSuccess && (
        <div className="submit-overlay success" role="dialog" aria-modal="true">
          <div className="submit-modal">
            <h3>RMA Submitted</h3>
            <p>Your RMA has been uploaded successfully.</p>
            <div className="submit-modal-actions">
              <button
                type="button"
                className="summary-edit-button"
                onClick={handlePrintRmaPdf}
              >
                Print RMA (PDF)
              </button>
              <button
                type="button"
                className="summary-submit-button"
                onClick={handleExportExcel}
              >
                Export to Excel
              </button>
            </div>
            <button
              type="button"
              className="modal-close-button"
              onClick={() => {
                setShowSubmissionSuccess(false);
                window.location.hash = "#home";
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

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
                    Select one or more categories and quantity, then generate
                    item rows.
                  </p>

                  <div className="selection-list">
                    {selections.map((row, index) => (
                      <div className="selection-row" key={`selection-${index}`}>
                        <div className="field-group">
                          <label>Category</label>
                          <div className="category-select-wrapper">
                            <button
                              type="button"
                              className={`category-select-trigger ${row.category ? "" : "is-placeholder"}`}
                              onClick={() => handleOpenCategoryMenu(index)}
                              aria-haspopup="listbox"
                              aria-expanded={
                                openSelectionCategoryIndex === index
                              }
                            >
                              <span>{row.category || "Select Category"}</span>
                              <span
                                className="category-caret"
                                aria-hidden="true"
                              >
                                v
                              </span>
                            </button>

                            {openSelectionCategoryIndex === index && (
                              <div className="category-select-menu">
                                <input
                                  type="text"
                                  className="category-search-input"
                                  placeholder="Search category..."
                                  value={categorySearchValues[index] || ""}
                                  onChange={(event) =>
                                    handleCategorySearchChange(
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  autoFocus
                                />
                                <div
                                  className="category-option-list"
                                  role="listbox"
                                >
                                  {getFilteredCategories(index).map(
                                    (option) => (
                                      <button
                                        type="button"
                                        key={option}
                                        className={`category-option ${row.category === option ? "active" : ""}`}
                                        onClick={() =>
                                          handleCategorySelect(index, option)
                                        }
                                      >
                                        {option}
                                      </button>
                                    ),
                                  )}
                                  {getFilteredCategories(index).length ===
                                    0 && (
                                    <div className="category-option-empty">
                                      No category found.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="field-group quantity-group">
                          <label htmlFor={`quantity-${index}`}>Quantity</label>
                          <input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(event) =>
                              handleSelectionChange(
                                index,
                                "quantity",
                                event.target.value,
                              )
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
                      Complete all fields below before submitting your RMA
                      request.
                    </div>
                  </div>
                  <div className="summary-row">
                    Total Items: {generatedItems.length}
                  </div>

                  <div className="preview-table-wrapper">
                    <div className="preview-table-scroll">
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
                            <td>
                              <div className="category-select-wrapper table-category-wrapper">
                                <button
                                  type="button"
                                  className={`category-select-trigger table-category-trigger ${item.category ? "" : "is-placeholder"}`}
                                  onClick={() => handleOpenGeneratedCategoryMenu(index)}
                                  aria-haspopup="listbox"
                                  aria-expanded={openGeneratedCategoryIndex === index}
                                  ref={(element) => {
                                    generatedCategoryTriggerRefs.current[index] = element;
                                  }}
                                >
                                  <span>{item.category || "Select Category"}</span>
                                  <span className="category-caret" aria-hidden="true">
                                    v
                                  </span>
                                </button>

                              </div>
                            </td>
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
                                min={item.dateOfPurchase || undefined}
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
                  </div>

                  {openGeneratedCategoryIndex !== null &&
                    generatedCategoryMenuStyle &&
                    createPortal(
                      <div
                        className="category-select-menu table-category-menu table-category-menu-floating"
                        style={generatedCategoryMenuStyle}
                      >
                        <input
                          type="text"
                          className="category-search-input"
                          placeholder="Search category..."
                          value={categorySearchValues[openGeneratedCategoryIndex] || ""}
                          onChange={(event) =>
                            handleCategorySearchChange(
                              openGeneratedCategoryIndex,
                              event.target.value,
                            )
                          }
                          autoFocus
                        />
                        <div className="category-option-list" role="listbox">
                          {getFilteredCategories(openGeneratedCategoryIndex).map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`category-option ${
                                generatedItems[openGeneratedCategoryIndex]?.category === option
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleGeneratedCategorySelect(openGeneratedCategoryIndex, option)
                              }
                            >
                              {option}
                            </button>
                          ))}
                          {getFilteredCategories(openGeneratedCategoryIndex).length === 0 && (
                            <div className="category-option-empty">No category found.</div>
                          )}
                        </div>
                      </div>,
                      document.body,
                    )}

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
                      Review Summary
                    </button>
                  </div>
                </>
              )}

              {generatedFormError && (
                <p className="form-error">{generatedFormError}</p>
              )}
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
                Submitted:{" "}
                {new Date(submissionSnapshot.submittedAt).toLocaleString()}
              </p>
              <p className="summary-meta">
                Total Items: {submissionSnapshot.totalItems}
              </p>

              <div className="preview-table-wrapper">
                <div className="preview-table-scroll">
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

              <div className="summary-actions">
                <button
                  type="button"
                  className="summary-edit-button"
                  onClick={handleEditSummary}
                  disabled={isSubmittingFinal}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="summary-submit-button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmittingFinal || isFinalSubmitted}
                >
                  {isFinalSubmitted
                    ? "Submitted"
                    : isSubmittingFinal
                      ? "Submitting..."
                      : "Submit"}
                </button>
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
