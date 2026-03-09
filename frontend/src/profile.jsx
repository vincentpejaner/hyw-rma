import "./profile.css";
import { useState, useEffect } from "react";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

function Profile() {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({
    companyName: "",
    fullName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
  });

  const storedAccount = JSON.parse(localStorage.getItem("account"));

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(
          `http://192.168.254.148:3001/api/hyw/selectprofile/${storedAccount.account_id}`,
        );

        const data = await res.json();

        if (res.ok && data.profile) {
          setData({
            fullName: data.profile.db_fullname || "",
            companyPhone: data.profile.db_phone_number || "",
            companyEmail: data.profile.db_companyEmail || "",
            companyName: data.profile.db_companyName || "",
            companyAddress: data.profile.db_companyAddress || "",
          });
          setEditing(true);
        } else {
          setData({
            fullName: data.db_fullname || "",
            companyPhone: data.db_phone_number || "",
            companyEmail: data.db_companyEmail || "",
            companyName: data.db_companyName || "",
            companyAddress: data.db_companyAddress || "",
          });
          setEditing(false);
        }
      } catch (err) {
        console.error(err);

        setData({
          fullName: data.db_fullname || "",
          companyPhone: data.db_phone_number || "",
          companyEmail: data.db_companyEmail || "",
          companyName: data.db_companyName || "",
          companyAddress: data.db_companyAddress || "",
        });
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

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
        console.log(result);
        setData({
          companyName: "",
          fullName: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
        });
      }
    } catch (error) {
      console.log("Server error:", error);
    }
  }

  return (
    <div className="submit-container">
      <SiteHeader />

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
              {editing ? "Update" : "Save changes"}
            </button>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default Profile;
