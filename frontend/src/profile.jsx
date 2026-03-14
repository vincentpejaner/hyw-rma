import "./profile.css";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";
import { API_BASE } from "./api-base.js";
import { checkSession } from "./checkSession.js";

const EMPTY_PROFILE = {
  companyName: "",
  fullName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
};

const PROFILE_FIELDS = [
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    placeholder: "Enter company name",
    helper: "Shown on your RMA request summary and reports.",
  },
  {
    name: "fullName",
    label: "Contact Person / Full Name",
    type: "text",
    placeholder: "Enter full name",
    helper: "Primary contact for RMA follow-ups and approvals.",
  },
  {
    name: "companyEmail",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
    helper: "Used for request updates and ticket communication.",
  },
  {
    name: "companyPhone",
    label: "Contact Number",
    type: "text",
    placeholder: "Enter contact number",
    helper: "Include a reachable phone or mobile number.",
  },
  {
    name: "companyAddress",
    label: "Company Address",
    type: "text",
    placeholder: "Enter company address",
    helper: "Used for pickup, delivery, and billing reference.",
    wide: true,
  },
];

const getStoredAccount = () => {
  try {
    const rawAccount = window.localStorage.getItem("account");
    return rawAccount ? JSON.parse(rawAccount) : null;
  } catch {
    return null;
  }
};

function Profile() {
  const account = getStoredAccount();
  const accountId = account?.account_id ? Number(account.account_id) : null;

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(EMPTY_PROFILE);
  const [initialData, setInitialData] = useState(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const completedFields = useMemo(
    () =>
      Object.values(data).filter((value) => String(value || "").trim() !== "")
        .length,
    [data],
  );
  const completionPercent = Math.round(
    (completedFields / PROFILE_FIELDS.length) * 100,
  );
  const hasChanges = useMemo(
    () =>
      PROFILE_FIELDS.some(
        ({ name }) =>
          String(data[name] || "") !== String(initialData[name] || ""),
      ),
    [data, initialData],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (showSuccessModal) {
      setShowSuccessModal(false);
    }

    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  }

  useEffect(() => {
    if (!accountId) {
      setIsLoading(false);
      setStatus({
        type: "error",
        message: "No account session found. Please sign in again.",
      });
      return;
    }

    useEffect(() => {
      const interval = setInterval(() => {
        checkSession();
      }, 5000);

      return () => clearInterval(interval);
    }, []);

    async function loadProfile() {
      setIsLoading(true);
      setStatus({ type: "", message: "" });

      try {
        const response = await fetch(`${API_BASE}/selectprofile/${accountId}`);
        const result = await response.json();
        const profile = result?.profile || result || {};

        setData({
          fullName: profile.db_fullname || "",
          companyPhone: profile.db_phone_number || "",
          companyEmail: profile.db_companyEmail || "",
          companyName: profile.db_companyName || "",
          companyAddress: profile.db_companyAddress || "",
        });
        setInitialData({
          fullName: profile.db_fullname || "",
          companyPhone: profile.db_phone_number || "",
          companyEmail: profile.db_companyEmail || "",
          companyName: profile.db_companyName || "",
          companyAddress: profile.db_companyAddress || "",
        });
        setEditing(Boolean(result?.profile));
      } catch (error) {
        console.error(error);
        setStatus({
          type: "error",
          message: "Unable to load your profile right now.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [accountId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!accountId) {
      setStatus({
        type: "error",
        message: "No account session found. Please sign in again.",
      });
      return;
    }

    if (!hasChanges) {
      return;
    }

    const payload = {
      ...data,
      accountId,
    };

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });

      const response = await fetch(
        editing
          ? `${API_BASE}/update-profile/${accountId}`
          : `${API_BASE}/insert-profile`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save profile.");
      }

      setEditing(true);
      setInitialData(data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error?.message || "Server error while saving profile.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="submit-container profile-page">
      {showSuccessModal && (
        <div className="profile-modal-overlay" role="presentation">
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-success-title"
          >
            <button
              type="button"
              className="profile-modal-close"
              aria-label="Close success dialog"
              onClick={() => setShowSuccessModal(false)}
            >
              x
            </button>
            <h3 id="profile-success-title">Successfully Updated profile</h3>
            <p>
              Your account details have been saved and will be used for future
              RMA requests.
            </p>
          </div>
        </div>
      )}

      <SiteHeader />

      <main className="submit-main profile-main">
        <section className="profile-shell">
          <div className="profile-hero">
            <div>
              <p className="profile-eyebrow">Account Profile</p>
              <h1>Keep your RMA contact details complete and up to date.</h1>
              <p className="profile-subtitle">
                This information is used in generated RMA forms, summary sheets,
                and support coordination.
              </p>
            </div>

            <div className="profile-stats">
              <div className="profile-stat-card">
                <span className="profile-stat-label">Profile completion</span>
                <strong>{completionPercent}%</strong>
                <span className="profile-stat-note">
                  {completedFields} of {PROFILE_FIELDS.length} fields completed
                </span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-label">Form mode</span>
                <strong>{editing ? "Update profile" : "Create profile"}</strong>
                <span className="profile-stat-note">
                  Changes apply to future RMA requests.
                </span>
              </div>
            </div>
          </div>

          <div className="profile-form-card">
            <div className="profile-form-header">
              <div>
                <h2>Business Contact Details</h2>
                <p>Review each field carefully before saving.</p>
              </div>
              <div className="profile-progress-chip">
                {completedFields}/{PROFILE_FIELDS.length} complete
              </div>
            </div>

            {status.type === "error" && status.message && (
              <div
                className={`profile-status profile-status-${status.type || "info"}`}
              >
                {status.message}
              </div>
            )}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-grid">
                {PROFILE_FIELDS.map((field) => (
                  <div
                    className={`profile-field ${field.wide ? "profile-field-wide" : ""}`}
                    key={field.name}
                  >
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      id={field.name}
                      type={field.type}
                      name={field.name}
                      value={data[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      disabled={isLoading || isSaving}
                      autoComplete="off"
                    />
                    <p className="profile-field-helper">{field.helper}</p>
                  </div>
                ))}
              </div>

              <div className="profile-actions">
                <p className="profile-actions-note">
                  {isLoading
                    ? "Loading profile..."
                    : hasChanges
                      ? "You have unsaved changes ready to update."
                      : "No changes yet. Update the form to enable saving."}
                </p>
                <button
                  type="submit"
                  className="save-button"
                  disabled={isLoading || isSaving || !hasChanges}
                >
                  {isSaving && (
                    <span className="save-button-spinner" aria-hidden="true" />
                  )}
                  <span>
                    {isLoading
                      ? "Loading..."
                      : isSaving
                        ? "Updating database..."
                        : editing
                          ? "Update Profile"
                          : "Save Profile"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Profile;
