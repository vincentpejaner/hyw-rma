import { useEffect } from "react";
import "./login.css";
import "./about.css";
import SiteHeader from "./site-header.jsx";
import SiteFooter from "./site-footer.jsx";

export default function About() {
  useEffect(() => {
    const opts = { threshold: 0.15, rootMargin: "0px 0px -5% 0px" };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          const delay = el.dataset.delay || el.getAttribute("data-delay") || 0;
          if (delay) el.style.transitionDelay = `${delay}s`;
          el.classList.add("in-view");
          obs.unobserve(el);
        }
      });
    }, opts);

    document.querySelectorAll(".animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <SiteHeader />

      <section className="about-hero">
        <div className="container">
          <p className="about-kicker animate">About HYW IT Distributor</p>
          <h1 className="animate" data-delay="0.03">
            Built on reliable distribution, trusted partnerships, and service
            excellence.
          </h1>
          <p className="about-hero-sub animate" data-delay="0.06">
            From regional operations to nationwide support, HYW continues to
            strengthen product availability and after-sales service for IT
            businesses and enterprise clients.
          </p>
        </div>
      </section>

      <main className="about-content">
        <div className="container">
          <section className="section-block">
            <h2 className="animate">Company Profile</h2>
            <p className="lead animate" data-delay="0.04">
              HYW IT Distributor delivers quality hardware products with a
              strong commitment to responsive support. Our RMA system is part of
              a broader service strategy focused on transparency, speed, and
              dependable client communication.
            </p>

            <div className="about-grid">
              <div>
                <div className="card animate" data-delay="0.06">
                  <h3>Brief History</h3>
                  <div className="timeline">
                    <div className="event">
                      <div className="date">2012</div>
                      <div className="desc">
                        Established in Cebu City, building early trust through
                        prompt delivery and dedicated post-sales service.
                      </div>
                    </div>

                    <div className="event">
                      <div className="date">2013</div>
                      <div className="desc">
                        Expanded to Davao City to support growing demand and
                        improve service coverage in the region.
                      </div>
                    </div>

                    <div className="event">
                      <div className="date">2018</div>
                      <div className="desc">
                        Opened Quezon City access point to strengthen Luzon
                        logistics and nationwide client support.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card value-grid" style={{ marginTop: 20 }}>
                  <div className="feature-box animate" data-delay="0.08">
                    <h4>Mission</h4>
                    <p>
                      Help clients succeed by providing quality products and
                      service experiences from sourcing to after-sales support.
                    </p>
                  </div>

                  <div className="feature-box animate" data-delay="0.1">
                    <h4>Values</h4>
                    <p>
                      Reliability, clear communication, fair pricing, and
                      standing behind every product with accountability.
                    </p>
                  </div>
                </div>
              </div>

              <aside>
                <div className="card animate" data-delay="0.09">
                  <h4>Goals & Vision</h4>
                  <p>
                    Provide top-tier IT solutions for every market segment while
                    setting a high standard in customer experience and technical
                    support.
                  </p>
                </div>

                <div className="card" style={{ marginTop: 18 }}>
                  <h4>Key Brands</h4>
                  <div className="brand-grid" style={{ marginTop: 12 }}>
                    {[
                      "ACER",
                      "AOC",
                      "ASUS",
                      "BIOSTAR",
                      "DAHUA",
                      "EPSON",
                      "GIGABYTE",
                      "HIKVISION",
                      "HP",
                      "KINGSTON",
                      "LENOVO",
                      "MSI",
                      "SEAGATE",
                      "TENDA",
                      "WD",
                    ].map((b, i) => (
                      <div
                        key={b}
                        className="brand-badge animate"
                        data-delay={(0.02 * (i + 1)).toFixed(2)}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="section-block">
            <div className="section-head animate">
              <p className="about-kicker">What Makes Us Different</p>
              <h2>Service principles that keep enterprise support dependable.</h2>
            </div>
            <div className="pillars-grid">
              <article className="pillar-card animate" data-delay="0.03">
                <h3>Operational Reliability</h3>
                <p>
                  Structured workflows and proven escalation processes reduce
                  delays and keep service commitments on track.
                </p>
              </article>
              <article className="pillar-card animate" data-delay="0.07">
                <h3>Transparent Communication</h3>
                <p>
                  Clients receive clear status updates, documented actions, and
                  visible milestones throughout each service cycle.
                </p>
              </article>
              <article className="pillar-card animate" data-delay="0.11">
                <h3>Stronger Technical Support</h3>
                <p>
                  Product knowledge and coordinated diagnostics help resolve
                  hardware concerns faster and more consistently.
                </p>
              </article>
              <article className="pillar-card animate" data-delay="0.15">
                <h3>Long-Term Partnership Mindset</h3>
                <p>
                  We focus on sustainable relationships through accountability,
                  stable service quality, and measurable outcomes.
                </p>
              </article>
            </div>
          </section>

          <section className="section-block">
            <div className="stats-wrap">
              <article className="mini-stat animate">
                <h3>3</h3>
                <p>Major service locations supporting nationwide distribution.</p>
              </article>
              <article className="mini-stat animate" data-delay="0.06">
                <h3>10+</h3>
                <p>Years of IT distribution and service operations experience.</p>
              </article>
              <article className="mini-stat animate" data-delay="0.12">
                <h3>15+</h3>
                <p>Key technology brands supported across product categories.</p>
              </article>
            </div>
          </section>

          <section className="about-cta animate">
            <div className="about-cta-inner">
              <p className="about-kicker">Work With HYW</p>
              <h2>Need a dependable hardware distribution and RMA partner?</h2>
              <p>
                Our team is ready to support your operations with organized
                service workflows and reliable post-sales handling.
              </p>
              <div className="about-cta-actions">
                <a href="#submit" className="btn-primary">
                  Submit RMA
                </a>
                <a href="#track" className="btn-secondary">
                  Track RMA
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter
        email="hywcebu.corporate@gmail.com"
        emailHref="hywcebu.corporate@gmail.com"
        phoneLabel="032-415-1014"
        phoneHref="0324151014"
        address="Unit 3 Ang-Atillo Bldg., Legaspi St. cor. Plaridel Extn., Brgy. Sto. Nino, Cebu City, Cebu, Philippines"
        companyLabel="HYW"
        description="HYW RMA Management System - Your trusted return and warranty solution."
        copyright="(c) 2026 HYW IT DISTRIBUTOR. All rights reserved."
      />
    </div>
  );
}
