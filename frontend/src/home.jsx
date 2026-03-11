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
import esGamingDark from "./images/ESGAMING001.png";
import esGamingLight from "./images/ESGAMING002.png";
const PAGE_TRANSITION_MS = 240;

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

      <main className="home-hero-page">
        <section className="home-hero">
          <div className="home-hero-text">
            <div className="hero-pill">INTRODUCING</div>

            <h1 className="hero-animate-title">
              RMA
              <br />
             SYSTEM
            </h1>

            <p className="hero-animate-desc">
              The best way to manage RMA requests instead of email backlogs.
              Handle product returns, status updates, and service records at
              scale.
            </p>

            <div className="home-hero-actions">
              <a href="#track" className="hero-btn hero-btn-outline">
                Track RMA &gt;
              </a>
              <a href="#submit" className="hero-btn hero-btn-solid">
                Submit RMA &gt;
              </a>
            </div>
          </div>

          <div className="home-hero-visual">
            <span className="hero-floating hero-floating-front">ESGAMING</span>
            <span className="hero-floating hero-floating-end">CASING</span>
            <img
              className="hero-image hero-image-dark"
              src={esGamingDark}
              alt="RMA dark hero visual"
            />
            <img
              className="hero-image hero-image-light"
              src={esGamingLight}
              alt="RMA light hero visual"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function App() {
  const [displayPage, setDisplayPage] = useState(() => getCurrentPage());
  const [transitionClass, setTransitionClass] = useState("page-transition-enter");
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.body.classList.contains("dark-mode"),
  );

  useEffect(() => {
    let transitionTimeout;

    const onHash = () => {
      const hash = (window.location.hash || "#home").replace("#", "");
      const route = hash.split("/")[0];
      const targetRoute =
        route === "submit" && !isAuthenticated() ? "login" : route;

      if (route === "submit" && !isAuthenticated()) {
        window.location.hash = "#login";
      }

      if (targetRoute === displayPage) {
        return;
      }

      setTransitionClass("page-transition-exit");
      clearTimeout(transitionTimeout);
      transitionTimeout = window.setTimeout(() => {
        setDisplayPage(targetRoute);
        setTransitionClass("page-transition-enter");
      }, PAGE_TRANSITION_MS);
    };

    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      clearTimeout(transitionTimeout);
    };
  }, [displayPage]);

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const nextDarkMode = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode", nextDarkMode);
    window.localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
    setIsDarkMode(nextDarkMode);
  };

  let pageComponent = <Home />;
  if (displayPage === "about") pageComponent = <About />;
  if (displayPage === "login") pageComponent = <Login />;
  if (displayPage === "my-rma") pageComponent = <MyRma />;
  if (displayPage === "submit") pageComponent = <Submit />;
  if (displayPage === "track") pageComponent = <Track />;
  if (displayPage === "profile") pageComponent = <Profile />;

  return (
    <>
      <div className={`page-transition-layer ${transitionClass}`}>
        {pageComponent}
      </div>
      <button
        type="button"
        className="theme-fab"
        onClick={handleThemeToggle}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Light mode" : "Dark mode"}
      >
        {isDarkMode ? "☀" : "☾"}
      </button>
    </>
  );
}
