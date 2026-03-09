import "./login.css";
import { useState } from "react";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";
import logo from "./images/logo1.png";

function Login() {
  const [credential, setCredential] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setCredential({ ...credential, [name]: value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credential.email || !credential.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.254.131:3001/api/hyw/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...credential }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "account",
        JSON.stringify({
          account_id: data.account.account_id,
          account_username: data.account.account_username,
          account_name: data.account.account_name,
        }),
      );
      console.log(
        "Login successful:",
        JSON.parse(localStorage.getItem("account")),
      );

      setLoading(false);

     window.location.hash = `#submit/${data.account.account_id}`;
    } catch (err) {
      console.error("Server error:", err);
      setError("Server error. Try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <SiteHeader />
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-logo">
            <img src={logo} alt="HYW Logo" />
          </div>
          <div className="login-header">
            <h1>Log In</h1>
            <p>HYW RMA System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credential.email}
                name="email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credential.password}
                name="password"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <a href="#forgot">Forgot password?</a>
          </div>
        </div>

        <SiteFooter />
      </div>
    </div>
  );
}

export default Login;
