import "./home.css";
import { useState, useEffect } from "react";
import About from "./about";
import Login from "./login.jsx";
import MyRma from "./my-rma.jsx";
import Submit from "./submit.jsx";
import Track from "./track.jsx";
import Profile from "./profile.jsx";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

function isAuthenticated() {
  return Boolean(window.localStorage.getItem("account"));
}

function getCurrentPage() {
  const route = (window.location.hash || "#home").replace("#", "");

  if (route === "submit" && !isAuthenticated()) {
    return "login";
  }

  return route;
}

function Home() {

  return (
    <div className="site-container">
      <SiteHeader />

      <main className="home-main">
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-badge">HYW • RMA Management</div>

            <h1>
              Fast, traceable RMA requests — from submission to resolution.
            </h1>
            <p>
              Submit your return or warranty request online and track progress
              using your Ticket ID. Clear status updates, organized details, and
              a better experience for both clients and technicians.
            </p>

            <div className="hero-cta">
              <a href="#submit" className="btn primary">
                Submit RMA
              </a>
              <a href="#track" className="btn">
                Track RMA
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-title">One Ticket ID</div>
                <div className="stat-sub">
                  Everything is traceable in one place.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Clear Summary</div>
                <div className="stat-sub">
                  Customer + product details shown instantly.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Faster Handling</div>
                <div className="stat-sub">
                  Less back-and-forth, more action.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() => getCurrentPage());

  useEffect(() => {
    const onHash = () => {
      const hash = (window.location.hash || "#home").replace("#", "");
      const route = hash.split("/")[0];

      if (route === "submit" && !isAuthenticated()) {
        window.location.hash = "#login";
        setPage("login");
        return;
      }

      setPage(route);
    };

    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "about") return <About />;
  if (page === "login") return <Login />;
  if (page === "my-rma") return <MyRma />;
  if (page === "submit") return <Submit />;
  if (page === "track") return <Track />;
  if (page === "profile") return <Profile />;

  return <Home />;
}
