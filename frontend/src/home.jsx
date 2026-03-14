import "./home.css";
import { useState, useEffect, useRef } from "react";
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
  const route = (window.location.hash || "#home").replace("#", "").split("/")[0];
  const authenticated = isAuthenticated();

  if (route === "submit" && !authenticated) {
    return "login";
  }

  if (route === "login" && authenticated) {
    return "home";
  }

  return route;
}

function Home() {
  const statsRef = useRef(null);
  const [startStats, setStartStats] = useState(false);
  const [statsValues, setStatsValues] = useState({
    requests: 0,
    repaired: 0,
    clients: 0,
    hours: 0,
  });

  useEffect(() => {
    const animatedBlocks = document.querySelectorAll("[data-animate]");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 },
    );

    animatedBlocks.forEach((block) => revealObserver.observe(block));

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!statsRef.current) {
      return undefined;
    }

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStartStats(true);
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );

    statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!startStats) {
      return undefined;
    }

    const targets = {
      requests: 1200,
      repaired: 850,
      clients: 300,
      hours: 48,
    };

    const duration = 1500;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setStatsValues({
        requests: Math.round(targets.requests * eased),
        repaired: Math.round(targets.repaired * eased),
        clients: Math.round(targets.clients * eased),
        hours: Math.round(targets.hours * eased),
      });

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(rafId);
  }, [startStats]);

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
            <span className="hero-floating hero-floating-end">ESGAMING</span>
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

        <section className="home-section why-rma-section">
          <div className="home-section-shell two-column">
            <div className="section-copy" data-animate="fade-right">
              <p className="section-kicker">Why Use The RMA System</p>
              <h2>Move beyond slow, email-based return handling.</h2>
              <p>
                Traditional email threads make hardware return requests difficult
                to manage, easy to lose, and hard to monitor across teams.
                Conversations get scattered, updates are delayed, and service
                history becomes incomplete.
              </p>
              <p>
                With a centralized RMA workflow, every request is tracked in one
                place, every status is visible, and every service record stays
                organized for better support decisions.
              </p>
            </div>

            <div className="benefit-grid" data-animate="fade-left">
              <article className="benefit-card">
                <span className="benefit-icon">CT</span>
                <h3>Centralized Tracking</h3>
                <p>All return activity lives in one searchable dashboard.</p>
              </article>
              <article className="benefit-card">
                <span className="benefit-icon">FU</span>
                <h3>Faster Updates</h3>
                <p>Real-time progress replaces manual status follow-ups.</p>
              </article>
              <article className="benefit-card">
                <span className="benefit-icon">SR</span>
                <h3>Service Records</h3>
                <p>Complete history per product for transparent support.</p>
              </article>
              <article className="benefit-card">
                <span className="benefit-icon">WF</span>
                <h3>Streamlined Workflow</h3>
                <p>Structured steps reduce handling errors and bottlenecks.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-section core-features-section">
          <div className="home-section-shell">
            <div className="section-head" data-animate="fade-up">
              <p className="section-kicker">Core Features</p>
              <h2>Everything needed for reliable hardware RMA operations.</h2>
            </div>

            <div className="feature-grid">
              <article className="feature-card" data-animate="fade-up" style={{ "--delay": "40ms" }}>
                <h3>Submit RMA Request</h3>
                <p>Capture product details, issues, and return data through a guided form.</p>
              </article>
              <article className="feature-card" data-animate="fade-up" style={{ "--delay": "110ms" }}>
                <h3>Track RMA Status</h3>
                <p>Monitor each ticket from intake to resolution without email chasing.</p>
              </article>
              <article className="feature-card" data-animate="fade-up" style={{ "--delay": "180ms" }}>
                <h3>Service Records</h3>
                <p>Maintain clear historical records for auditing and support quality.</p>
              </article>
              <article className="feature-card" data-animate="fade-up" style={{ "--delay": "250ms" }}>
                <h3>Faster Workflow</h3>
                <p>Improve turnaround times with standardized, trackable process steps.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-section process-section">
          <div className="home-section-shell">
            <div className="section-head" data-animate="fade-up">
              <p className="section-kicker">RMA Process</p>
              <h2>A clear step-by-step lifecycle for every ticket.</h2>
            </div>

            <div className="process-timeline">
              {[
                "Submit Request",
                "Ticket Generated",
                "Technician Diagnosis",
                "Status Updates",
                "Product Returned",
              ].map((step, index) => (
                <article
                  className="process-step"
                  key={step}
                  data-animate="scale-in"
                  style={{ "--delay": `${index * 85}ms` }}
                >
                  <div className="process-dot">{index + 1}</div>
                  <h3>{step}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section stats-section" ref={statsRef}>
          <div className="home-section-shell">
            <div className="stats-grid">
              <article className="stat-tile" data-animate="fade-up">
                <h3>{statsValues.requests}+</h3>
                <p>RMA Requests Processed</p>
              </article>
              <article className="stat-tile" data-animate="fade-up" style={{ "--delay": "90ms" }}>
                <h3>{statsValues.repaired}+</h3>
                <p>Products Repaired</p>
              </article>
              <article className="stat-tile" data-animate="fade-up" style={{ "--delay": "180ms" }}>
                <h3>{statsValues.clients}+</h3>
                <p>Active Clients</p>
              </article>
              <article className="stat-tile" data-animate="fade-up" style={{ "--delay": "270ms" }}>
                <h3>{statsValues.hours} hrs</h3>
                <p>Average Update Time</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-section why-choose-section">
          <div className="home-section-shell">
            <div className="section-head" data-animate="fade-up">
              <p className="section-kicker">Why Choose HYW</p>
              <h2>Built for dependable service and long-term client trust.</h2>
            </div>

            <div className="trust-grid">
              <article className="trust-card" data-animate="fade-up" style={{ "--delay": "40ms" }}>
                <h3>Reliable Handling</h3>
                <p>Consistent process control from ticket creation to product return.</p>
              </article>
              <article className="trust-card" data-animate="fade-up" style={{ "--delay": "110ms" }}>
                <h3>Transparent Updates</h3>
                <p>Clear progress visibility for customers and internal service teams.</p>
              </article>
              <article className="trust-card" data-animate="fade-up" style={{ "--delay": "180ms" }}>
                <h3>Faster Communication</h3>
                <p>Structured workflows reduce delays and remove unclear follow-ups.</p>
              </article>
              <article className="trust-card" data-animate="fade-up" style={{ "--delay": "250ms" }}>
                <h3>Organized Records</h3>
                <p>Every service event is captured for accountability and reporting.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="home-section final-cta-section" data-animate="scale-in">
          <div className="home-section-shell final-cta-shell">
            <p className="section-kicker">Ready To Start</p>
            <h2>Start Managing Your RMAs Efficiently</h2>
            <p>
              Submit requests, track updates, and simplify hardware service
              workflows.
            </p>
            <div className="home-hero-actions">
              <a href="#submit" className="hero-btn hero-btn-solid">
                Submit RMA &gt;
              </a>
              <a href="#track" className="hero-btn hero-btn-outline">
                Track RMA &gt;
              </a>
            </div>
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
      const authenticated = isAuthenticated();

      if (route === "submit" && !authenticated) {
        window.location.hash = "#login";
        return;
      }

      if (route === "login" && authenticated) {
        window.location.hash = "#home";
        return;
      }

      const targetRoute = route || "home";

      if (
        !["home", "about", "login", "my-rma", "submit", "track", "profile"].includes(
          targetRoute,
        )
      ) {
        window.location.hash = "#home";
        return;
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
